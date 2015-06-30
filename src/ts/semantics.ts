/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="ast.ts" />
/// <reference path="fromJS.d.ts" />

module eiffel.semantics {

  import sym = eiffel.symbols;
  import LookupTable = eiffel.util.LookupTable;
  import caseIgnoreEquals = eiffel.util.caseIgnoreEquals;
  import pairs = eiffel.util.pairs;
  import group = eiffel.util.group;
  import debugAssert = eiffel.util.debugAssert;
  import mapToArray = eiffel.util.mapToArray;
  import exactlyOne = eiffel.util.exactlyOne;

  var started = false;
  export var builtinContext: AnalysisContext;
  var createClassSymbols = function (asts, analysisContext:AnalysisContext) {
    asts.forEach(function (ast:eiffel.ast.Class) {
      if (!(ast instanceof eiffel.ast.Class)) {
        console.error("Root AST node is not instance of Class", ast);
        throw new Error("Root AST node is not instance of Class");
      }

      var name = ast.name.name;
      var classSymbol = new symbols.ClassSymbol(name, name, ast);

      analysisContext.classSymbols.set(classSymbol.lowerCaseName, classSymbol);
      analysisContext.allClasses.push(classSymbol);
    });
  };

  var createFeatureSymbols = function (analysisContext:AnalysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new FeatureDiscovery(analysisContext, classSymbol), null);
    });
  };

  var createRoutineLocalSymbols = function (analysisContext) {
    analysisContext.classSymbols.forEach(function (oneClass) {
      oneClass.declaredRoutines.forEach(function (routine) {
        var localsBlocks:eiffel.ast.LocalsBlock[] = <eiffel.ast.LocalsBlock[]> routine.ast.children.filter(function (child) {
          return child instanceof eiffel.ast.LocalsBlock;
        });

        localsBlocks.forEach(function (localBlock:eiffel.ast.LocalsBlock) {
          localBlock.varDeclLists.forEach(function (varsDecl) {
            varsDecl.varDecls.forEach(function (varDecl) {
              var varName = varDecl.name.name;
              var lcName = varName.toLowerCase();
              var variableSymbol = new symbols.VariableSymbol(varName, varDecl, varsDecl.rawType);
              routine.locals.push(variableSymbol);
              routine.localsByName.set(lcName, variableSymbol);
              routine.localsAndParamsByName.set(lcName, variableSymbol);
            });
          });
        });
      });
    });
  };

  function makeActualTypeIn(sourceClass: sym.ClassSymbol, rawType: eiffel.ast.AST, analysisContext: AnalysisContext, likeInClass?: sym.ClassSymbol, inFeature?: eiffel.symbols.FeatureSymbol, typeFor?: TypeFor): sym.ActualType {
    var isGenericParam = function isGenericParam(): boolean {
      if (rawType instanceof eiffel.ast.Type) {
        return sourceClass.hasGenericParameterWithName(rawType.name.name);
      }
      else {
        return false;
      }
    };
    if (rawType instanceof eiffel.ast.TypeLikeFeature) {
      if (rawType.typeName !== null) {
        return makeActualTypeIn(sourceClass, rawType.typeName, analysisContext).typeForCall(rawType.featureName.name);
      }
      else {
        var lcName = rawType.featureName.name.toLowerCase();
        if (typeFor === TypeFor.LOCAL && inFeature.localsByName.has(lcName)) {
          return inFeature.localsByName.get(lcName).type.duplicate();
        }
        else if (inFeature.parametersByName.has(lcName)) {
          return inFeature.parametersByName.get(lcName).type.duplicate();
        }
        else if (likeInClass.finalFeatures.has(lcName)) {
          return likeInClass.finalFeatures.get(lcName).typeInstance.duplicate();
        }
        else {
          console.error("Invalid case", lcName, sourceClass, rawType);
        }
      }
    }
    else if (rawType instanceof eiffel.ast.Type && isGenericParam()) {
      if (rawType.parameters.length !== 0) {
        analysisContext.errors.uncategorized("You cannot use a generic parameter as the base class of a generic type.");
      }
      return sourceClass.genericParameterWithName(rawType.name.name);
    }
    else {
      return makeTypeInstanceIn(sourceClass, rawType, analysisContext, likeInClass, inFeature, typeFor);
    }
  }

  function makeTypeInstanceIn(sourceClass: sym.ClassSymbol, rawType: eiffel.ast.AST, analysisContext: AnalysisContext, likeInClass?: sym.ClassSymbol, inFeature?: eiffel.symbols.FeatureSymbol, typeFor?: TypeFor): sym.TypeInstance {
    if (rawType instanceof eiffel.ast.TypeLikeFeature) {
      console.warn("Type like feature used, not yet implemented");
      return null;
    }
    else if (rawType instanceof eiffel.ast.TypeLikeCurrent) {
      if (sourceClass.typeInstance === null) {
        console.error("sourceClass.typeInstance not initialized");
      }
      return sourceClass.typeInstance.duplicate();
    }
    if (rawType instanceof eiffel.ast.Type) {
      var baseName = rawType.name.name;

      var isGenericParam = function isGenericParam(name:string):boolean {
        return sourceClass.hasGenericParameterWithName(name);
      };

      var isClassName = function isClassName(name:string):boolean {
        return analysisContext.hasClass(name);
      };

      if (isGenericParam(baseName)) {
        debugger;
        analysisContext.errors.uncategorized("You must use the name of a class here, you've given the name of a generic parameter however." + baseName);
      }
      else if (isClassName(baseName)) {
        var baseType = analysisContext.classWithName(baseName);
        var missingParam = false;
        var substitutions = new eiffel.symbols.Substitution();
        var typeParamInstances = rawType.parameters.map(function (rawTypeParameter, i) {
          var result = makeActualTypeIn(sourceClass, rawTypeParameter, analysisContext, likeInClass, inFeature, typeFor);
          if (result == null) {
            missingParam = true;
          }
          else if (baseType instanceof eiffel.symbols.ClassSymbol) {
            substitutions.addSubstitution(baseType.genericParametersInOrder[i], result);
          }

          return result;
        });

        return new eiffel.symbols.TypeInstance(baseType, typeParamInstances, sourceClass, substitutions);
      }
      else {
        analysisContext.errors.unknownClass(rawType.name);
      }
    }
    else {
      console.error(rawType);
      throw new Error("Invalid AST type for type: ");
    }

  }

  /**
   * Check whether amount of generic parameters is correct
   * @param instance
   * @param context
   */
  var validateTypeInstance = function validateTypeInstance(instance: eiffel.symbols.TypeInstance, context: AnalysisContext) {
    // TODO implement constraints
    if (instance instanceof eiffel.symbols.GenericParameterSymbol) {
      return true;
    }

    var sourceClass = instance.sourceClass;
    var baseType = instance.baseType;

    var expectedParamCount = baseType.genericParametersInOrder.length;
    var actualParamCount = instance.typeParameters.length;

    if (expectedParamCount < actualParamCount) {
      var difference = actualParamCount - expectedParamCount;
      context.errors.uncategorized("Missing " + difference + " generic parameters.");
    }
    else if (expectedParamCount > actualParamCount) {
      context.errors.uncategorized("Too many generic arguments, you can only have " + expectedParamCount + ", but you have " + actualParamCount);
    }

    instance.typeParameters.forEach(<(TypeInstance) => void> _.partial(validateTypeInstance, _, context));
  };

  var initParentTypeInstancesAndValidate = function initParentTypeInstancesAndValidate(analysisContext: AnalysisContext): void {
    var defaultParentGroup: ast.ParentGroup = <ast.ParentGroup> <any> eiffel.parser.parse(" inherit\n  ANY", {startRule: "ParentGroup"});
    var typeInstances: sym.TypeInstance[] = [];
    analysisContext.allClasses.forEach(function (oneClass) {
      function processParentGroup(parentGroup: ast.ParentGroup) {
        parentGroup.parents.forEach(function (parent: ast.Parent) {
          var typeInstance = makeTypeInstanceIn(oneClass, parent.rawType, analysisContext);
          var parentSymbol = new eiffel.symbols.ParentSymbol(parent, parentGroup, typeInstance, oneClass);
          parent.parentSymbol = parentSymbol;
          typeInstances.push(parent.parentSymbol.parentType);
          oneClass.parentSymbols.push(parentSymbol);
        });
      }
      oneClass.ast.parentGroups.forEach(processParentGroup);
      if (oneClass.ast.parentGroups.length === 0) {
        if (oneClass.lowerCaseName !== "any") {
          processParentGroup(defaultParentGroup);
        }
      }
    });

    // Validate all
    typeInstances.map(<any> _.partial(validateTypeInstance, _, analysisContext));
  };



  var parseError = function parseError(builtinSource, e) {
    console.group("Parse Error: " + builtinSource.filename);
    console.log("Found", e.found);
    console.groupCollapsed("Expected");
    console.table(e.expected);
    console.groupEnd();
    console.group("Context");
    var lines = builtinSource.content.split(/\r?\n/);

    var context =
      lines[e.line - 4]
      + lines[e.line - 3] + "\n"
      + lines[e.line - 2] + "\n"
      + lines[e.line - 1] + "\n"
      + Array(e.column).join("-") + "^ -- Line: " + e.line + " Column: " + e.column + "\n"
      + lines[e.line + 0]
      + lines[e.line + 1]
      + lines[e.line + 2]
      + lines[e.line + 3];
    console.log(context);
    console.groupEnd();
    console.groupCollapsed("Source");
    console.log(builtinSource.content);
    console.groupEnd();
    console.log(e);
    console.groupEnd();
  };

  var initAstDictionary = function initAstDictionary(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new AstToDictionaryByPrototype(analysisContext), analysisContext.astDictionary);
    });
  };

  var initAstDictionaryByClass = function initAstDictionaryByClass(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.accept(new AstToDictionaryByPrototype(analysisContext), classSymbol.ast.dictionary);
    });
  };

  var requireValidClassForAnalysis = function requireClassForAnalysis(name:string, analysisContext:AnalysisContext, success:(symbol:eiffel.symbols.ClassSymbol, context:AnalysisContext) => any, failure:(context:AnalysisContext) => any):any {
    if (analysisContext.hasClass(name)) {
      return success(analysisContext.classWithName(name), analysisContext);
    }
    else {
      failure(analysisContext);
      return false;
    }
  }
  type DescendantChain = eiffel.symbols.ClassSymbol[];
  var checkCyclicInheritance = function (analysisContext) {
    var inheritanceBeingChecked:Set<eiffel.symbols.ClassSymbol> = new Set<eiffel.symbols.ClassSymbol>();
    var inheritanceChecked:Set<eiffel.symbols.ClassSymbol> = new Set<eiffel.symbols.ClassSymbol>();
    var inheritanceCycles:eiffel.symbols.ClassSymbol[][] = [];
    var hasValidHierarchy = function hasValidHierarchy(oneClass:eiffel.symbols.ClassSymbol, descendants: DescendantChain) {
      if (inheritanceBeingChecked.has(oneClass)) {
        oneClass.hasCyclicInheritance = true;
        analysisContext.errors.inheritanceCycle(descendants.slice(descendants.indexOf(oneClass)));
        inheritanceCycles.push(descendants.slice());
        return;
      }
      else if (inheritanceChecked.has(oneClass)) {
        /**
         * Already done, do nothing
         */
        return;
      }
      else {
        inheritanceBeingChecked.add(oneClass);
        oneClass.ast.parentGroups.forEach(function (parentGroup:eiffel.ast.ParentGroup) {
          parentGroup.parents.forEach(function (parent:eiffel.ast.Parent) {
            var parentName = parent.rawType.name.name;
            requireValidClassForAnalysis(parentName, analysisContext,
              function (parentSymbol:eiffel.symbols.ClassSymbol) {
                if (parentSymbol.hasCyclicInheritance) {
                  /**
                   * This implies that hasValidHierarchy() has already been called on parentSymbol
                   * Implying that all the cycles it participates in have already been identified
                   * Thus, this `oneClass` cannot be inside any such cycle.
                   *
                   */
                  oneClass.inheritsFromCyclicInheritance = true;
                }
                else {
                  descendants.push(oneClass);
                  hasValidHierarchy(parentSymbol, descendants);
                  descendants.pop();
                  oneClass.hasCyclicInheritance = parentSymbol.hasCyclicInheritance;
                  oneClass.inheritsFromCyclicInheritance = parentSymbol.inheritsFromCyclicInheritance;
                }
              },
              function failure(ac:AnalysisContext) {
                analysisContext.errors.unknownClass(parent.rawType.name);
              }
            );
          })
        });
        inheritanceBeingChecked.delete(oneClass);
        inheritanceChecked.add(oneClass);
      }
    };

    analysisContext.allClasses.forEach(function (oneClass:eiffel.symbols.ClassSymbol) {
      hasValidHierarchy(oneClass, []);
    });

    if (inheritanceCycles.length > 0) {
      analysisContext.errors.uncategorized("Cyclic inheritance detected");
      console.error("Cycles:", inheritanceCycles);
    }
  };


  var initGenericParamSyms = function (analysisContext) {
    analysisContext.allClasses.map(function (oneClass) {
      oneClass.ast.genericParameters.forEach(function (genericParameter: ast.FormalGenericParameter) {
        var name = genericParameter.name.name;
        var fqName = oneClass.name + "." + genericParameter.name.name;

        var genericParamSym = new eiffel.symbols.GenericParameterSymbol(name, fqName, oneClass);

        genericParameter.sym = genericParamSym;
        oneClass.genericParametersInOrder.push(genericParamSym);
        if (oneClass.hasGenericParameterWithName(name)) {
          analysisContext.errors.duplicateGenericParameter(genericParameter.name);
        }
        else {
          oneClass.genericParametersByName.set(name.toLowerCase(), genericParamSym);
        }
      });
    });
  };

  var initClassSymbolTypeInstances = function initClassSymbolTypeInstances(analysisContext) {
    analysisContext.allClasses.map(function (oneClass) {
      oneClass.typeInstance = new eiffel.symbols.TypeInstance(oneClass, oneClass.genericParametersInOrder, oneClass, new eiffel.symbols.Substitution());
    });
  };

  var checkValidty_8_6_13_parent_rule = function checkValidty_8_6_13_parent_rule(analysisContext: AnalysisContext) {
    analysisContext.allClasses.forEach(function (oneClass) {
      // For every class
      // 1 In every Parent part for a class B, B is not a descendant of D.
      // 2 No conforming parent is a frozen class.
      // 3 If two or more Parent parts are for classes which have a common ancestor A, D meets the conditions of the Repeated Inheritance Consistency constraint for A.
      // DELAYED
      // 4 At least one of the Parent parts is conforming.
      // 5 No two ancestor types of D are different generic derivations of the same class.
      // 6 Every Parent is generic-creation-ready


      var conformingCount = 0;

      if (oneClass.ast.parentGroups.length == 0) {
        // Implicit ANY ancestor
        conformingCount = 1;
      }

      var allParents = [];

      oneClass.ast.parentGroups.forEach(function (parentGroup) {
        var nonConforming = false;
        if (parentGroup.conforming != null) {
          if (caseIgnoreEquals(parentGroup.conforming.name, "NONE")) {
            nonConforming = true;
          }
          else {
            analysisContext.errors.uncategorized("Invalid nonconformance modifier: " + parentGroup.conforming.name + " in class " + oneClass.name);
          }
        }

        if (!nonConforming) {
          conformingCount++;
        }

        parentGroup.parents.forEach(function (parent ) {
          // POINT 2
          allParents.push(parent);
          if (parent.parentSymbol.parentType.baseType.isFrozen && nonConforming) {
            analysisContext.errors.noFrozenParent(oneClass, parent);
          }
        });
      });

      if (conformingCount == 0) {
        analysisContext.errors.noConformingParent(oneClass);
      }

      oneClass.ancestorTypesByBaseType.forEach(function (typesWithSameBase) {
        pairs(typesWithSameBase).forEach(function (a) {
          if (a[0].differentGenericDerivationThan(a[1])) {
            debugger;
            a[0].differentGenericDerivationThan(a[1]);
            analysisContext.errors.differentGenericDerivations(oneClass, a[0], a[1]);
          }
        });
      })
    });
  };

  export function traverseInheritance<A>(f: (sym: sym.ClassSymbol, context?: AnalysisContext, a?: A) => any, analysisContext: AnalysisContext, arg?: A) {
    var classes = analysisContext.allClasses;
    var seen = new Set<sym.ClassSymbol>();

    function processClass(clazz: sym.ClassSymbol) {
      if (!seen.has(clazz)) {
        seen.add(clazz);

        if (clazz.inheritsFromCyclicInheritance) {
          return;
        }

        if (clazz.hasCyclicInheritance) {
          return;
        }

        // Good to go, not in any cycles


        // Make sure all parents have been processed
        clazz.ast.parentGroups.forEach(function (parentGroup) {
          parentGroup.parents.forEach(function (parent) {
            processClass(parent.parentSymbol.parentType.baseType);
          })
        });

        f(clazz, analysisContext, arg);
      }
    }

    processClass(analysisContext.classWithName("ANY"));
    classes.forEach(processClass);
  }

  export function populateAncestorTypes(oneClass: eiffel.symbols.ClassSymbol) {

    oneClass.ancestorTypes.push(new eiffel.symbols.TypeInstance(oneClass, oneClass.genericParametersInOrder.slice(), oneClass, null));

    oneClass.parentSymbols.forEach(function (parentSymbol) {
      var substitutedAncestors = parentSymbol.parentType.baseType.ancestorTypes.map(function (ancestorType) {
        return parentSymbol.parentType;
      });
      Array.prototype.push.apply(oneClass.ancestorTypes, substitutedAncestors);
    });
    oneClass.ancestorTypes.forEach(function (ancestorType) {
      var key = ancestorType.baseType;
      if (!oneClass.ancestorTypesByBaseType.has(key)) {
        oneClass.ancestorTypesByBaseType.set(key, []);
      }
      oneClass.ancestorTypesByBaseType.get(key).push(ancestorType);
    });
  }

  export function inheritFeatures(oneClass: eiffel.symbols.ClassSymbol, context: AnalysisContext) {
    /**
     * Constructed as pe 6.16.12
     * @type {Array}
     */
    var precursors = [];
    var uniqueFeatures = new Map<string, Map<sym.FeatureSymbol, sym.FeatureSymbol>>();
    var pretenders = new Map<string, eiffel.symbols.FeaturePretenders>();

    if (oneClass.lowerCaseName === "any") {
      // ANY is already initialized
      return;
    }


    oneClass.parentSymbols.forEach(function (parentSymbol: eiffel.symbols.ParentSymbol) {
      if (parentSymbol.isNonConforming) {
        console.error("Nonconforming inheritance is not supported");
        debugger;
      }
      if (parentSymbol.parentType.baseType === oneClass) {
        console.error("Parents should not contain itself");
        debugger;
      }
      else {
        var errorPrefix = oneClass.name + " extends " + parentSymbol.parentType.baseType.toString() + ": ";
        var parentFinalFeatures = parentSymbol.inheritFeatures();

        // RENAME
        var oldNameToNewName = new Map<string, string>();
        function getNewName(name: string): string {
          if (oldNameToNewName.has(name.toLowerCase())) {
            return oldNameToNewName.get(name.toLowerCase());
          }
          return name;
        }
        parentSymbol.renames.forEach(function makeRenameMapping(rename:eiffel.ast.Rename) {
          var oldName = rename.oldName.name;
          var lcOldName = oldName.toLowerCase();
          if (!parentFinalFeatures.has(lcOldName)) {
            context.errors.unknownOldFeatureInRename(rename, parentSymbol);
          }
          else {
            if (oldNameToNewName.has(lcOldName)) {
              context.errors.alreadyRenamed(rename, oldNameToNewName.get(lcOldName), parentSymbol);
            }
            else {
              oldNameToNewName.set(lcOldName, rename.newName.name.name);
            }
          }
        });

        var newNameToOldName = new Map<string, string>();
        oldNameToNewName.forEach((newName, oldName) => newNameToOldName.set(newName, oldName));

        function getOldName(oldName: string): string {
          if (newNameToOldName.has(oldName.toLowerCase())) {
            return newNameToOldName.get(oldName.toLowerCase());
          }
          return oldName;
        }


        // UNDEFINES
        var undefines = new Set<string>();
        parentSymbol.undefines.forEach(function (identifier) {
          var lcUndefine = identifier.name.toLowerCase();
          // VDUS_1
          if (!parentFinalFeatures.has(getOldName(lcUndefine))) {
            if (parentFinalFeatures.has(lcUndefine)) {
              context.errors.uncategorized(errorPrefix + "You have tried undefining a feature by its old name, you need to use " + getNewName(lcUndefine) + " instead!");
            }
            else {
              context.errors.uncategorized(errorPrefix + "VDUS_1, tried undefining feature that does not exist in parent: " + lcUndefine);
            }
          }

          // VDUS_4
          if (undefines.has(lcUndefine)) {
            context.errors.uncategorized(errorPrefix + "VDUS_4, why undefine the same feature multiple times?" + lcUndefine);
          }

          undefines.add(lcUndefine);
        });

        var redefines = new Set<string>();
        parentSymbol.redefines.forEach(function (identifier) {
          var lcRedefine = identifier.name.toLowerCase();
          // VDRS_1
          if (!parentFinalFeatures.has(getOldName(lcRedefine))) {
            if (parentFinalFeatures.has(lcRedefine)) {
              context.errors.uncategorized(errorPrefix + "You have tried redefining a feature by its old name, you need to use " + getNewName(lcRedefine) + " instead!");
            }
            else {
              context.errors.uncategorized(errorPrefix + "tried redefining feature that does not exist in parent: " + lcRedefine);
            }
          }

          // VDUS_4
          if (redefines.has(lcRedefine)) {
            context.errors.uncategorized(errorPrefix + "You don't need to specify redefine for a feature multiple times: " + lcRedefine);
          }

          redefines.add(lcRedefine);
        });

        var selected = new Set<string>();
        parentSymbol.selects.forEach(function (identifier) {
          var lcSelected = identifier.name.toLowerCase();
          // VDRS_1
          if (!parentFinalFeatures.has(getOldName(lcSelected))) {
            if (parentFinalFeatures.has(lcSelected)) {
              context.errors.uncategorized(errorPrefix + "You have tried selecting a feature by its old name, you need to use " + getNewName(lcSelected) + " instead!");
            }
            else {
              context.errors.uncategorized(errorPrefix + "tried selecting feature that does not exist in parent: " + lcSelected);
            }
          }

          // VDUS_4
          if (selected.has(lcSelected)) {
            context.errors.uncategorized(errorPrefix + "You don't need to specify select for a feature multiple times: " + lcSelected);
          }

          selected.add(lcSelected);
        });



        parentFinalFeatures.forEach(function (finalFeature, lcOldName) {
          debugAssert(lcOldName === lcOldName.toLowerCase(), lcOldName + " is not lower case");
          var finalFeatureName = finalFeature.name;

          if (oldNameToNewName.has(lcOldName)) {
            finalFeatureName = oldNameToNewName.get(lcOldName);
            finalFeature.name = finalFeatureName;
            finalFeature.lowerCaseName = finalFeatureName.toLowerCase();
          }

          var lcName = finalFeatureName.toLowerCase();

          if (!pretenders.has(lcName)) {
            pretenders.set(lcName, new eiffel.symbols.FeaturePretenders());
          }

          var featurePretenders: eiffel.symbols.FeaturePretenders = pretenders.get(lcName);
          var pretenderSource = new eiffel.symbols.PretenderSource();
          pretenderSource.feature = finalFeature;
          pretenderSource.wasUndefined = undefines.has(lcName);
          pretenderSource.wasRedefined = redefines.has(lcName);
          pretenderSource.wasSelected = selected.has(lcName);
          pretenderSource.parentSymbol = parentSymbol;

          if (pretenderSource.wasRedefined) {
            featurePretenders.redefined.push(pretenderSource);
          }
          else if (pretenderSource.wasUndefined) {
            featurePretenders.deferred.push(pretenderSource);
          }
          else if (pretenderSource.feature.isDeferred) {
            featurePretenders.deferred.push(pretenderSource);
          }
          else {
            featurePretenders.effective.push(pretenderSource);
          }

          if (pretenderSource.wasSelected) {
            featurePretenders.selected.push(pretenderSource);
          }
        });
      }
    });

    pretenders.forEach(function (pretender, lcName) {
      var errorPrefix = oneClass.name + "." + lcName + ": ";
      var declaredFeature = oneClass.declaredFeatures.get(lcName);
      var hasError = false;
      var hasMultiple = false;

      var hasDeclaredFeature = declaredFeature instanceof eiffel.symbols.FeatureSymbol;
      var hasDeclaredEffectiveFeature = hasDeclaredFeature && !declaredFeature.isDeferred;
      var hasDeclaredDeferredFeature = hasDeclaredFeature && declaredFeature.isDeferred;
      var inheritedFeature: eiffel.symbols.FeatureSymbol = null;

      if (declaredFeature === null) {
        if (pretender.redefined.length > 1) {
          context.errors.uncategorized(errorPrefix + "You have told eiffel that you want to redefine the inherited feature " + lcName + " but you didn't provide a new definition for the feature in the class " + oneClass.name);
          hasError = true;
        }
      }

      if (pretender.effective.length == 0) {
        // everything all right

        if (pretender.redefined.length >= 1) {
          inheritedFeature = declaredFeature;
        }
        else if (pretender.deferred.length >= 1) {
          inheritedFeature = pretender.deferred[0].feature;
        }

      }
      else if (pretender.effective.length >= 1) {
        if (hasDeclaredFeature) {
          hasError = true;
          hasMultiple = true;
          context.errors.uncategorized(errorPrefix + "You have inherited a feature " + lcName + " as effective. However, you have defined a new feature with the same name, but you cannot have two features with the same name.");
        }
        else {
          if (pretender.effective.length > 1) {
            var asts = new Set<any>();
            // merge identical features
            pretender.effective.forEach(x => asts.add(x.feature.ast));
            if (asts.size === 1) {
              // just merge precursors
            }
            else {
              hasError = true;
              hasMultiple = true;
              console.error(pretender);
              debugger;
              context.errors.uncategorized(errorPrefix + "You have inherited multiple different features under the same name " + lcName + ". You can undefine all but one, or you can rename such that all have different names, or define them into a common version.");
            }
          }

          if (!hasMultiple) {
            if (pretender.redefined.length == 0) {
              // everything all right
              inheritedFeature = pretender.effective[0].feature;
            }
            else {
              hasError = true;
              pretender.redefined.forEach(function (redefined) {
                if (redefined.wasUndefined) {
                  context.errors.uncategorized(errorPrefix + "You have inherited one feature as effective. Also, you have marked a different inherited feature as undefined and redefined. You can remove the entry in undefined");
                }
                else {
                  context.errors.uncategorized(errorPrefix + "You have inherited one feature as effetice. Also, you have marked a different inherited feature to be redefined, did you want to undefine that feature instead?")
                }
              });
            }
          }
          else {
            // more than one effective feature, no redefined feature
          }
        }
      }

      if (!hasMultiple) {
        oneClass.inheritedFeatures.set(lcName, inheritedFeature);
        inheritedFeature.precursors = new Set<eiffel.symbols.FeatureSymbol>();
        pretender.all().forEach(function (source: eiffel.symbols.PretenderSource) {
          source.feature.precursors.forEach(function (precursor) {
            inheritedFeature.precursors.add(precursor);
          });// TODO FIX PRECURSOR HANDLING
          if (hasDeclaredFeature) {
            inheritedFeature.precursors.add(inheritedFeature);
          }
        });
        oneClass.finalFeatures.set(lcName, inheritedFeature);
      }
      else {
        console.error("Multiple versions for " + lcName + " in class " + oneClass.name, oneClass);
      }


    });

    oneClass.declaredFeatures.forEach(function (declaredFeature, lcName) {
      if (!oneClass.finalFeatures.has(lcName)) {
        oneClass.finalFeatures.set(lcName, declaredFeature);
      }
    });


    // console.log(precursors);
  }

  function initAdaptions(context: AnalysisContext) {
    var parents = context.astDictionary.get(eiffel.ast.Parent);
    if (parents === undefined) {
      return;
    }
    parents.forEach(function (parent:eiffel.ast.Parent) {
      var parentSymbol = parent.parentSymbol;
      var seen = new Set<any>();
      var errored = new Set<any>();
      parent.adaptions.forEach(function addAdaptionToParentSymbol(adaption: any) {
        // Check for duplicate adaptions
        var constructor = Object.getPrototypeOf(adaption).constructor;
        if (seen.has(constructor)) {
          if (!errored.has(constructor)) {
            errored.add(constructor);
            context.errors.duplicateAdaptionsOfType(constructor.name, adaption);
          }
        }
        else {
          seen.add(constructor);
        }

        // register adaption
        if (adaption instanceof eiffel.ast.Renames) {
          Array.prototype.push.apply(parentSymbol.renames, (<eiffel.ast.Renames> adaption).renames);
        }
        if (adaption instanceof eiffel.ast.Undefines) {
          Array.prototype.push.apply(parentSymbol.undefines, adaption.identifiers);
        }
        if (adaption instanceof eiffel.ast.Redefines) {
          Array.prototype.push.apply(parentSymbol.redefines, adaption.identifiers);
        }
        if (adaption instanceof eiffel.ast.Selects) {
          Array.prototype.push.apply(parentSymbol.selects, adaption.identifiers);
        }
      });
    });
  }



  function initAny(context: AnalysisContext) {
    var anySym = context.classWithName("ANY");
    anySym.declaredFeatures.forEach(function initAnyFeature(feature: sym.FeatureSymbol, featureName) {
      anySym.finalFeatures.set(featureName, feature);
      feature.routineId = new eiffel.symbols.RoutineId(anySym, feature);
      // feature.identity = feature;
    });
  }


  function initReturnTypeTypeInstances(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.declaredFeatures.forEach(function (fSym:eiffel.symbols.FeatureSymbol) {
        if (fSym.isCommand) {
          fSym.typeInstance = null;
        }
        else {
          fSym.typeInstance = makeActualTypeIn(classSymbol, fSym.ast.rawType, analysisContext);
        }
      });
    });
  }

  function initSignatures(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.declaredFeatures.forEach(function (fSym:eiffel.symbols.FeatureSymbol) {
        fSym.signature = new eiffel.symbols.Signature(fSym.parameters.map(x => x.type), fSym.typeInstance);
      });
    });
  }

  function setupRoutineIds(oneClass: eiffel.symbols.ClassSymbol, context: AnalysisContext) {
    var seedToFeatureGraph = new eiffel.util.Graph<eiffel.symbols.FeatureSymbol>([], {autoAdd: true});

    oneClass.inheritedFeatures.forEach(function (feature, lcName) {
      feature.pretenders.all().forEach(function (pretenderSource) {
        console.log(pretenderSource.feature.seeds);
      })
    });
  }


  function initParameters(oneClass: eiffel.symbols.ClassSymbol, context: AnalysisContext) {
    oneClass.finalFeatures.forEach(function (featureSym) {
      if (featureSym instanceof eiffel.symbols.RoutineSymbol) {
        var paramNames = new Set<string>();
        var ast = <eiffel.ast.Routine> featureSym.ast;
        ast.parameters.forEach(function (varDeclList) {
          varDeclList.varDecls.forEach(function (varDeclEntry: eiffel.ast.VarDeclEntry) {
            var paramName = varDeclEntry.name.name;
            if (paramNames.has(paramName)) {
              context.errors.uncategorized("VREG?? Duplicate argument name");
            }
            paramNames.add(paramName);
            varDeclEntry.sym = new eiffel.symbols.VariableSymbol(paramName, varDeclEntry, varDeclList.rawType);
            featureSym.parameters.push(varDeclEntry.sym);
            featureSym.parametersByName.set(paramName.toLowerCase(), varDeclEntry.sym);
          });
        });
      }
    });
  }

  function checkFeatureBlocks(context: AnalysisContext) {
    context.allClasses.forEach(function (oneClass) {
      oneClass.declaredRoutines.forEach(function (routine: eiffel.symbols.RoutineSymbol) {
        var seenBlockKind = new Map<any, eiffel.ast.RoutineInstructions>();

        var errorPrefix = oneClass.name + "." + routine.name + ": ";
        routine.ast.bodyElements.forEach(function (bodyElement) {
          if (bodyElement instanceof eiffel.ast.RoutineInstructions) {
            if (seenBlockKind.has(bodyElement.constructor)) {
              context.errors.uncategorized("You can only have one " + bodyElement.constructor.name);
            }
            seenBlockKind.set(bodyElement.constructor, bodyElement);
          }
        });

        var hasDeferred = seenBlockKind.has(eiffel.ast.DeferredBlock);
        var hasDo = seenBlockKind.has(eiffel.ast.DoBlock);
        var hasObsolete = seenBlockKind.has(eiffel.ast.ObsoleteBlock);
        var hasOnce = seenBlockKind.has(eiffel.ast.OnceBlock);
        var hasExternal = seenBlockKind.has(eiffel.ast.ExternalBlock);

        if (exactlyOne(hasDeferred, hasDo, hasExternal, hasOnce)) {
          // okay, exactly one block of those
          if (hasDeferred) {
            routine.isDeferred = true;
          }
        }
        else {
          context.errors.uncategorized(errorPrefix + "You must have exactly one of the following: deferred marker, do block, external marker or once block.");
        }

      });
    });
  }

  enum TypeFor {
    LOCAL,
    PARAM,
    FEATURE,
  }

  function evaluateLikeDependencies(oneClass: eiffel.symbols.ClassSymbol, context: AnalysisContext, depGraph: eiffel.util.Graph<string>) {
    var features = oneClass.finalFeatures;

    function getDependencies(currentFeature: eiffel.symbols.FeatureSymbol, type: eiffel.ast.AST, typeFor: TypeFor): string[] {
      if (type instanceof eiffel.ast.TypeLikeCurrent) {
        return [];
      }
      else if (type instanceof eiffel.ast.TypeLikeFeature) {
        var depTarget = oneClass.lowerCaseName + ".";
        var lcName = type.featureName.name.toLowerCase();
        if (type.typeName === null) {
          if (typeFor === TypeFor.LOCAL && currentFeature.localsByName.has(lcName)) {
            context.errors.uncategorized("You cannot use 'like' to refer to the type of another variable");
            return [depTarget + currentFeature.lowerCaseName + ".l." + lcName];
          }
          if (currentFeature.parametersByName.has(lcName)) {
            return [depTarget + currentFeature.lowerCaseName + ".p." + lcName];
          }
          else {
            if (oneClass.finalFeatures.has(lcName)) {
              return [depTarget + lcName];
            }
            else {
              context.errors.uncategorized("Invalid anchored type: a type in the signature of feature " + oneClass.name + "." + currentFeature.name + " depends on '" + lcName + "' which does not exist");
              return [];
            }
          }
        }
        else {
          var depTarget = type.typeName.name.name.toLowerCase();
          if (context.classWithName(depTarget).finalFeatures.has(lcName)) {
            return [depTarget + "." + lcName];
          }
        }
      }
      else if (type instanceof eiffel.ast.Type) {
        return Array.prototype.concat.apply([], type.parameters.map(x => getDependencies(currentFeature, x, typeFor)));
      }
      else {
        console.error("Unexpected AST type: ", type);
        debugger;
        return [];
      }
    }
    var classPrefix = oneClass.lowerCaseName + ".";
    features.forEach((feature, featureName) => {
      var prefix = classPrefix + feature.lowerCaseName;
      feature.locals.forEach((local) => {
        var rtDepds = getDependencies(feature, local.ast.varDeclList.rawType, TypeFor.PARAM);
        var fromName = prefix + ".l." + local.lowerCaseName;
        depGraph.addNode(fromName);
        rtDepds.forEach((depName) => {
          depGraph.connect(fromName, depName);
        });
      });

      feature.parameters.forEach((parameter) => {
        var rtDepds = getDependencies(feature, parameter.ast.varDeclList.rawType, TypeFor.PARAM);
        var fromName = prefix + ".p." + parameter.lowerCaseName;
        depGraph.addNode(fromName);
        rtDepds.forEach((depName) => {
          depGraph.connect(fromName, depName);
        });
      });

      if (feature.ast.rawType != null) {
        depGraph.addNode(prefix);
        var rtDepds = getDependencies(feature, feature.ast.rawType, TypeFor.FEATURE);
        rtDepds.forEach((depName) => {
          depGraph.connect(prefix, depName);
        });
      }
    });
  }

  var parse = function parse(builtinSource: BuiltinSource) {
    try {
      return eiffel.parser.parse(builtinSource.content)
    }
    catch (e) {
      parseError(builtinSource, e);
      throw e;
    }
  };

  function initializeAllTypes(likeDependencyGraph: eiffel.util.Graph<string>, context: AnalysisContext) {
    console.log("Dependency graph: ", likeDependencyGraph);
    var topoSort = likeDependencyGraph.tarjan();
    if (topoSort.length === likeDependencyGraph.nodes.size) {
      console.log("Anchored type analysis complete: No errors")
    }
    else {
      context.errors.uncategorized("Cycle in anchored types");
      return;
    }

    var localOrParamLength = "class.feature.p.paramName".split(".").length;

    topoSort.forEach(stronglyConnectedComponent => {
      debugAssert(stronglyConnectedComponent.length ===1, "More than one node in t he componenet");
      var typeLocation = stronglyConnectedComponent[0];
      var splitted = typeLocation.split(".");
      debugAssert(splitted.length >= 2, "Need to have format CLASS.FEATURE at the very least");

      var classSym = context.classWithName(splitted[0]);
      var fSym = classSym.finalFeatures.get(splitted[1]);

      if (splitted.length === localOrParamLength) {
        if (splitted[2] === "p") {
          var paramSym = fSym.parametersByName.get(splitted[3]);
          paramSym.type = makeActualTypeIn(fSym.declaredIn, paramSym.rawType, context, classSym, fSym, TypeFor.PARAM);
        }
        else if (splitted[2] ===  "l") {
          var localSym = fSym.localsByName.get(splitted[3]);
          localSym.type = makeActualTypeIn(fSym.declaredIn, localSym.rawType, context, classSym, fSym, TypeFor.LOCAL);
        }
        else {
          console.error("Invalid splitted[2]: ", splitted[2], splitted, typeLocation);
          debugger;
        }
      }
      else if (splitted.length === 2) {
        fSym.typeInstance = makeActualTypeIn(fSym.declaredIn, fSym.ast.rawType, context, classSym, fSym, TypeFor.FEATURE);
      }
      else {
        console.warn("Unsupported splitted.length: ", splitted, typeLocation);
      }
    });
  }

  interface ParsedFile {
    filename: string;
    asts: ast.Class[];
  }


  export function analyze(manyAsts: ParsedFile[]): AnalysisResult {
    if (!started) {
      start();
    }

    var asts: ast.Class[] = [];
    manyAsts.forEach(x => Array.prototype.push.apply(asts, x.asts));
    var analysisContext = new AnalysisContext();
    if (builtinContext != null) {
      analysisContext.parentContext = builtinContext;
    }
    createClassSymbols(asts, analysisContext);
    initGenericParamSyms(analysisContext);
    initClassSymbolTypeInstances(analysisContext);
    initAstDictionary(analysisContext);
    initAstDictionaryByClass(analysisContext);
    createFeatureSymbols(analysisContext);
    checkFeatureBlocks(analysisContext);
    createRoutineLocalSymbols(analysisContext);
    checkCyclicInheritance(analysisContext);
    initParentTypeInstancesAndValidate(analysisContext);
    //initReturnTypeTypeInstances(analysisContext);
    //initSignatures(analysisContext);
    // Can now use traverseInheritance
    traverseInheritance(populateAncestorTypes, analysisContext);
    initAdaptions(analysisContext);
    checkValidty_8_6_13_parent_rule(analysisContext);
    if (builtinContext == null) {
      initAny(analysisContext);
    }
    traverseInheritance(inheritFeatures, analysisContext);
    traverseInheritance(setupRoutineIds, analysisContext);
    traverseInheritance(initParameters, analysisContext);
    var likeDependencyGraph = new eiffel.util.Graph<string>([], {autoAdd: true});
    traverseInheritance(evaluateLikeDependencies, analysisContext, likeDependencyGraph);
    initializeAllTypes(likeDependencyGraph, analysisContext);




    analysisContext.allClasses.forEach(function (oneClass) {
      oneClass.ast.parentGroups.forEach(function (parentGroup) {
        parentGroup.parents.forEach(function (parent ) {
          validateTypeInstance(parent.parentSymbol.parentType, analysisContext);
        });
      });
    });




    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.creationClauses.forEach(function (creationClause) {

        creationClause.features.forEach(function (identifier) {
          var name: string = identifier.name;
          var lcName: string = name.toLowerCase();
          if (classSymbol.finalFeatures.has(lcName)) {
            var feature = classSymbol.finalFeatures.get(lcName);
            if (feature instanceof eiffel.symbols.ProcedureSymbol) {
              // Everything ok
              classSymbol.creationProcedures.set(lcName, feature);
            }
            else if (feature instanceof eiffel.symbols.FunctionSymbol) {
              analysisContext.errors.uncategorized("Functions cannot be used as creation procedures.");
            }
            else if (feature instanceof eiffel.symbols.AttributeSymbol) {
              analysisContext.errors.uncategorized("Attributes cannot be used as creation procedures.");
            }
            else {
              console.error(feature, creationClause, classSymbol, analysisContext);
              throw new Error("Unsupported symbol in finalFeatures");
            }
          }
          else {
            analysisContext.errors.uncategorized("There is no procedure with name " + name + " in class " + classSymbol.name);
          }
        });
      });
    });
    console.log(analysisContext);


    var newVar = {
      asts: asts,
      errors: analysisContext.errors,
      context: analysisContext,
    };
    return newVar;
  }

  export class AnalysisContext {
    classSymbols: LookupTable<sym.ClassSymbol> = new Map<string, sym.ClassSymbol>();
    allFunctions: symbols.FunctionSymbol[] = [];
    allProcedures: symbols.ProcedureSymbol[] = [];
    allRoutines: symbols.RoutineSymbol[] = [];
    allClasses: symbols.ClassSymbol[] = [];
    astDictionary: Map<any, eiffel.ast.AST[]> = new Map<any, eiffel.ast.AST[]>();
    typeInstances: sym.TypeInstance[] = [];
    parentContext: AnalysisContext;

    allWithPrototype(prototype) {
      if (this.astDictionary.has(prototype)) {
        return this.astDictionary.get(prototype);
      }
      else {
        console.error("Prototype is not a key", prototype, this.astDictionary);
        throw new Error("Prototype is not a key" + prototype);
      }
    }

    classWithName(name: string): eiffel.symbols.ClassSymbol {
      var lowerCaseName = this.redirectToSized(name).toLowerCase();
      if (this.classSymbols.has(lowerCaseName)) {
        return this.classSymbols.get(lowerCaseName);
      }
      else if (this.parentContext != null) {
        return this.parentContext.classWithName(name);
      }
      else {
        throw new Error("There is no class with name: " + name);
      }
    }

    hasClass(name: string): boolean {
      var lowerCaseName = this.redirectToSized(name).toLowerCase();
      if (this.parentContext != null) {
        return this.classSymbols.has(lowerCaseName) || this.parentContext.hasClass(name);
      }
      else {
        return this.classSymbols.has(lowerCaseName)
      }
    }

    redirectToSized(name: string): string {
      var mapping = {
        "integer": "INTEGER_32",
        "character": "CHARACTER_32",
        "double": "REAL_64",
        "real": "REAL_32",
      };
      var lowerCaseName = name.toLowerCase();
      if (mapping.hasOwnProperty(lowerCaseName)) {
        return mapping[lowerCaseName];
      }
      else {
        return name;
      }
    }

    errors: ErrorContext = new ErrorContext();
  }

  class ErrorContext {
    errors: string[] = [];

    add(kind: SemanticErrorKind, message: string, ast?: eiffel.ast.AST) {
      var entireMessage = SemanticErrorKind[kind] + ": " + message;
      console.error(entireMessage, ast);
      this.errors.push(entireMessage);
    }

    unknownClass(identifier: eiffel.ast.Identifier) {
      this.add(SemanticErrorKind.UnknownClass, identifier.name, identifier);
    }

    duplicateFeature(identifier: eiffel.ast.Identifier) {
      this.add(SemanticErrorKind.DuplicateFeatureName, identifier.name, identifier);
    }

    duplicateGenericParameter(identifier: eiffel.ast.Identifier) {
      this.add(SemanticErrorKind.DuplicateGenericParameter, identifier.name, identifier);
    }

    inheritanceCycle(descendants: DescendantChain) {
      /**
       * We want to have the first element as last one too, to make clear that it's a cycle
       */
      descendants.push(descendants[0]);
      /**
       * Also add second element (might also be first element because of push() above^
       */
      descendants.push(descendants[1]);
      this.add(SemanticErrorKind.InheritanceCycle, "... -> " + _.pluck(descendants, "name").join(" -> ") + " -> ...");
    }

    uncategorized(message: string): void {
      this.errors.push(message);
    }


    noConformingParent(oneClass: eiffel.symbols.ClassSymbol):void {
      this.add(SemanticErrorKind.NoConformingParents, "No conforming inheritance part found in class" + oneClass.name);
    }

    noFrozenParent(sourceClass: eiffel.symbols.ClassSymbol, parent: eiffel.ast.Parent): void {
      this.add(SemanticErrorKind.CannotExtendFrozenClass, sourceClass.name + " is trying to extend a frozen class", parent);
    }

    differentGenericDerivations(oneClass:eiffel.symbols.ClassSymbol, deriv1:eiffel.symbols.TypeInstance, deriv2:eiffel.symbols.TypeInstance):void {
      this.add(SemanticErrorKind.TwoAncestorsWithDifferentGenericDerivations, "For class " + oneClass.name + ": " + deriv1.repr + ", " + deriv2.repr);

    }

    duplicateAdaptionsOfType(name: string, adaption: eiffel.ast.AST):void {
      this.add(SemanticErrorKind.DuplicateAdaption, "Duplicate adaption: " + name);
    }

    unknownOldFeatureInRename(rename: eiffel.ast.Rename, parentSymbol: eiffel.symbols.ParentSymbol):void {
      var parentClassName = parentSymbol.parentType.baseType.name;
      this.add(SemanticErrorKind.UnknownSourceFeatureInRename, parentClassName + " has no feature " + rename.oldName.name + ". You told Eiffel to inherit a feature named '" + rename.oldName.name + "' from a class called '" + parentClassName + "' under a new name inside class " + parentSymbol.owningClass.name);
    }

    alreadyRenamed(rename:eiffel.ast.Rename, oldNewName: string, parentSymbol:eiffel.symbols.ParentSymbol):void {
      var parentClassName = parentSymbol.parentType.baseType.name;
      this.add(SemanticErrorKind.AlreadyRenamedFeature, rename.oldName.name + " has already been renamed to " + oldNewName);
    }
  }

  class SemanticVisitor<A, R> extends ast.Visitor<A, R> {
    classSymbols:LookupTable<sym.ClassSymbol>;
    analysisContext: AnalysisContext;


    constructor(analysisContext: AnalysisContext) {
      super();
      this.analysisContext = analysisContext;
      this.classSymbols = analysisContext.classSymbols;
    }
  }

  export enum SemanticErrorKind {
    DuplicateFeatureName,
    DuplicateParameterName,
    DuplicateClassName,
    UnknownClass,
    InheritanceCycle,
    DuplicateGenericParameter,
    NoConformingParents,
    CannotExtendFrozenClass,
    TwoAncestorsWithDifferentGenericDerivations,
    DuplicateAdaption,
    UnknownSourceFeatureInRename,
    AlreadyRenamedFeature,
  }

  class FeatureDiscovery extends SemanticVisitor<any, any> {

    constructor(analysisContext: AnalysisContext, classSymbol:symbols.ClassSymbol) {
      super(analysisContext);
      this.classSymbol = classSymbol;
    }

    classSymbol: symbols.ClassSymbol;

    vAttr(attr:eiffel.ast.Attribute, _:any):any {
      attr.frozenNamesAndAliases.forEach(function (fna, i) {
        var attrClone = attr.deepClone();
        fna = attrClone.frozenNamesAndAliases[i];

        var name = fna.name.name;
        var lcName = name.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen === undefined, attrClone, this.classSymbol);

        attrClone.sym = attributeSymbol;
        this.classSymbol.declaredFeatures.set(lcName, attributeSymbol);
        this.classSymbol.declaredAttributes.set(lcName, attributeSymbol);
      }, this);

      //return super.vAttr(attr, this.classSymbol);
    }

    vFunction(func:eiffel.ast.Function, _:any):any {
      func.frozenNamesAndAliases.forEach(function (fna, i) {
        var funcClone = func.deepClone();
        fna = funcClone.frozenNamesAndAliases[i];
        var functionName = fna.name.name;
        var lcFunctionName = functionName.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcFunctionName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var sym = new symbols.FunctionSymbol(lcFunctionName, alias, fna.frozen === undefined, funcClone, this.classSymbol);

        funcClone.sym = sym;
        this.classSymbol.declaredFeatures.set(lcFunctionName, sym);
        this.classSymbol.declaredFunctions.set(lcFunctionName, sym);
        this.classSymbol.declaredRoutines.set(lcFunctionName, sym);
        this.analysisContext.allFunctions.push(sym);
        this.analysisContext.allRoutines.push(sym);
      }, this);

      //return super.vFunction(func, this.classSymbol);
    }

    private errorOnDuplicateFeature(classSymbol, featureName, identifier) {
      if (classSymbol.hasSymbol(featureName)) {
        this.analysisContext.errors.duplicateFeature(identifier);
      }
    }

    vProcedure(procedure:eiffel.ast.Procedure, _:any):any {
      procedure.frozenNamesAndAliases.forEach(function (fna, i) {
        var procClone = procedure.deepClone();
        fna = procClone.frozenNamesAndAliases[i];

        var procedureName = fna.name.name;
        var lcProcedureName = procedureName.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcProcedureName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var sym = new symbols.ProcedureSymbol(procedureName, alias, fna.frozen === undefined, procClone, this.classSymbol);

        procClone.sym = sym;
        this.classSymbol.declaredFeatures.set(lcProcedureName, sym);
        this.classSymbol.declaredProcedures.set(lcProcedureName, sym);
        this.classSymbol.declaredRoutines.set(lcProcedureName, sym);
        this.analysisContext.allProcedures.push(sym);
        this.analysisContext.allRoutines.push(sym);
      }, this);
      //return super.vProcedure(procedure, this.classSymbol);
    }

    vConstantAttribute(constantAttribute:eiffel.ast.ConstantAttribute, _:any):any {
      constantAttribute.frozenNamesAndAliases.forEach(function (fna, i) {
        var attrClone = constantAttribute.deepClone();
        fna = attrClone.frozenNamesAndAliases[i];

        var name = fna.name.name;
        var lcName = name.toLowerCase();
        this.errorOnDuplicateFeature(this.classSymbol, lcName, fna.name);

        var alias: string = null;
        if (fna.alias != null) {
          alias = fna.alias.name.value;
        }
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen === undefined, attrClone, this.classSymbol);

        attrClone.sym = attributeSymbol;
        this.classSymbol.declaredFeatures.set(lcName, attributeSymbol);
        this.classSymbol.declaredAttributes.set(lcName, attributeSymbol);
      }, this);
      //return super.vConstantAttribute(constantAttribute, this.classSymbol);
    }
  }


  class AstToDictionaryByPrototype extends SemanticVisitor<any, any> {
    vDefault(ast:eiffel.ast.AST, arg:any):any {
      var constructor = Object.getPrototypeOf(ast).constructor;
      if (arg.has(constructor)) {
        arg.get(constructor).push(ast);
      }
    else {
        arg.set(constructor, [ast]);
      }
      return super.vDefault(ast, arg);
    }
  }


  class FeatureTypeConnector extends SemanticVisitor<any, any> {


  }
  export interface AnalysisResult {
    asts: eiffel.ast.Class[];
    errors: ErrorContext;
    context: AnalysisContext;
  }

  export function start(p?: (percentage: number) => void, done?: (context: AnalysisContext) => void, error?: (e: Error) => void) {
    started = true;
    var nextAst = 0;
    var parsed = [];

    var total = __eiffel_builtin.length;

    function parseOne() {
      try {
        var source = __eiffel_builtin[nextAst];
        var percentage = Math.round(nextAst / total * 100);
        if (p) {
          p(percentage);
        }
        else {
          console.log("Parsing ", source.filename);
          console.log("Done: " + percentage + "%");
        }
        parsed.push({
          filename: source.filename,
          asts: parse(source),
        });
        nextAst++;
        parseNext();
      }
      catch (e) {
        error && error(e);
        parseError(source, e);
      }
    }

    function parseNext() {
      if (nextAst < __eiffel_builtin.length) {
        setTimeout(parseOne, 50);
      }
      else {
        try {
          builtinContext = analyze(parsed).context;
          if (done) {
            done(builtinContext);
          }
        }
        catch (e) {
          console.error("Analysis error: ", e);
        }
      }
    }
    parseNext();
  }
}
