/// <reference path="visitor.ts" />
/// <reference path="util.ts" />
/// <reference path="fromJS.d.ts" />

module eiffel.semantics {
  import sym = eiffel.symbols;
  import LookupTable = eiffel.util.LookupTable;
  import caseIgnoreEquals = eiffel.util.caseIgnoreEquals;
  import pairs = eiffel.util.pairs;
  import group = eiffel.util.group;

  var createClassSymbols = function (asts, analysisContext:AnalysisContext) {
    asts.forEach(function (ast:eiffel.ast.Class) {
      if (!(ast instanceof eiffel.ast.Class)) {
        console.error("Root AST node is not instance of Class", ast);
        throw new Error("Root AST node is not instance of Class");
      }

      var name = ast.name.name;
      var classSymbol = new symbols.ClassSymbol(name, ast);

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
              var variableSymbol = new symbols.VariableSymbol(varName, varDecl, makeTypeInstanceIn(oneClass, varsDecl.rawType, analysisContext));
              routine.locals.push(variableSymbol);
              routine.localsAndParamsByName.set(varName, variableSymbol);
            });
          });
        });
      });
    });
  };

  function makeTypeInstanceIn(sourceClass: sym.ClassSymbol, rawType: eiffel.ast.Type, analysisContext: AnalysisContext) {
    if (!(rawType instanceof eiffel.ast.Type)) {
      return null;
    }

    var resolveType = function resolveType(identifier: eiffel.ast.Identifier) {
      var  name = identifier.name;
      if (sourceClass.hasGenericParameterWithName(name)) {
        return sourceClass.genericParameterWithName(name);
      }
      else if (analysisContext.hasClass(name)){
        return analysisContext.classWithName(name);
      }
      else {
        analysisContext.errors.unknownClass(identifier);
        return null;
      }
    };
    var baseType = resolveType(rawType.name);
    if (baseType === null) {
      return null;
    }
    var missingParam = false;
    var typeParamInstances = rawType.parameters.map(function (rawTypeParameter) {
      var result = makeTypeInstanceIn(sourceClass, rawTypeParameter, analysisContext);
      if (result == null) {
        missingParam = true;
      }
      return result;
    });
    if (missingParam) {
      return null;
    }

    return new eiffel.symbols.TypeInstance(baseType, typeParamInstances, sourceClass);
  }

  /**
   * Check whether amount of generic parameters is correct
   * @param instance
   * @param context
   */
  var validateTypeInstance = function validateTypeInstance(instance: eiffel.symbols.TypeInstance, context: AnalysisContext) {
    // TODO implement constraints

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
          var parentSymbol = new eiffel.symbols.ParentSymbol(parent, parentGroup, typeInstance);
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

        var genericParamSym = new eiffel.symbols.ClassSymbol(name, null);

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

  var handDownFeatures = function handDownFeatures(analysisContext: AnalysisContext) {
    var seen: Set<eiffel.symbols.ClassSymbol> = new Set<sym.ClassSymbol>();
    var process = function process(oneClass: sym.ClassSymbol, descendants: DescendantChain) {
      if (seen.has(oneClass)) {
        /**
         * Already finalized features, don't do anything
         */
        return;

      }
      else {
        oneClass.ast.parentGroups.forEach(function (parentGroup:eiffel.ast.ParentGroup) {
          parentGroup.parents.forEach(function (parent:eiffel.ast.Parent) {
            if (parent.parentSymbol !== null) {

            }
          })
        });
      }
    }
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

  export function traverseInheritance(f: (sym: sym.ClassSymbol, context?: AnalysisContext) => any, analysisContext: AnalysisContext) {
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

        f(clazz, analysisContext);
      }
    }

    processClass(analysisContext.classWithName("ANY"));
    classes.forEach(processClass);
  }

  export function populateAncestorTypes(oneClass: eiffel.symbols.ClassSymbol) {
    var genericInstances = oneClass.genericParametersInOrder.map(function (genericParam) {
      return new eiffel.symbols.TypeInstance(genericParam, [], oneClass);
    });

    oneClass.ancestorTypes.push(new eiffel.symbols.TypeInstance(oneClass, genericInstances, oneClass));

    oneClass.parentSymbols.forEach(function (parentSymbol) {
      var substitutedAncestors = parentSymbol.parentType.baseType.ancestorTypes.map(function (ancestorType) {
        return parentSymbol.parentType.substitute(ancestorType);
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
        var parentFinalFeatures = parentSymbol.parentType.baseType.finalFeatures;
        var featureNames = [];
        parentFinalFeatures.forEach(function extractFinalFeatureName(_, finalFeatureName) {
          featureNames.push(finalFeatureName);
        });



        // RENAME
        var oldNameToNewName = new Map<string, string>();

        parentSymbol.renames.forEach(function makeRenameMapping(rename:eiffel.ast.Rename) {
          var oldName = rename.oldName.name;
          if (!parentFinalFeatures.has(oldName)) {
            context.errors.unknownOldFeatureInRename(rename, parentSymbol);
          }
          else {
            if (oldNameToNewName.has(oldName)) {
              context.errors.alreadyRenamed(rename, oldNameToNewName.get(oldName), parentSymbol);
            }
            else {
              oldNameToNewName.set(oldName, rename.newName.name.name);
            }
          }
        });

        // UNDEFINES
        var undefines = new Set<string>();
        parentSymbol.undefines.forEach(function (identifier) {
          var lcUndefine = identifier.name.toLowerCase();
          // VDUS_1
          if (!parentFinalFeatures.has(lcUndefine)) {
            context.errors.uncategorized("VDUS_1, tried undefining feature that does not exist in parent: " + lcUndefine);
          }

          // VDUS_4
          if (undefines.has(lcUndefine)) {
            context.errors.uncategorized("VDUS_4, why undefine the same feature multiple times?" + lcUndefine);
          }

          undefines.add(lcUndefine);
        });




        parentFinalFeatures.forEach(function (finalFeature, oldFinalFeatureName) {
          var needsDuplicate = false;
          var finalFeatureName = oldFinalFeatureName;
          var newIsDeferred = finalFeature.isDeferred;
          if (oldNameToNewName.has(oldFinalFeatureName)) {
            needsDuplicate = true;
            finalFeatureName = oldNameToNewName.get(oldFinalFeatureName)
          }


          if (undefines.has(oldFinalFeatureName)) {
            needsDuplicate = true;
            finalFeature.duplicate();
            if (finalFeature.isDeferred) {
              // VDUS_3
              context.errors.uncategorized("VDUS_3, cannot make deferred feature deferred");
            }
            else {
              // VDUS_2
              if (finalFeature instanceof eiffel.symbols.AttributeSymbol) {
                context.errors.uncategorized("VDUS_2, cannot undefine attribute");
              }
              newIsDeferred = true;
            }


            // VDUS_5
            // Any redeclaration of f in C specifies a deferred feature.
            if (oneClass.declaredFeatures.has(finalFeatureName)) {
              if (!oneClass.declaredFeatures.get(finalFeatureName).isDeferred) {
                context.errors.uncategorized("VDUS_5, tried effecting a feature that was inherited as undefined: " + finalFeatureName);
              }
            }
          }

          var isUnique = true;
          if (uniqueFeatures.has(finalFeatureName)) {
            var uniquesWithSameName = uniqueFeatures.get(finalFeatureName);
            if (uniquesWithSameName.has(finalFeature.identity)) {
              isUnique = false;

              // "unique" feature might be marked as deferred because deferred clause is already processed
              // override deferred state
              if (!newIsDeferred) {
                var duplicate = uniquesWithSameName.get(finalFeature.identity);
                duplicate.isDeferred = false;
              }
            }
          }
          else {
            uniqueFeatures.set(finalFeatureName, new Map<sym.FeatureSymbol, sym.FeatureSymbol>());
          }

          if (isUnique) {
            var finalFeatureRenamedAndDeferred = finalFeature.duplicate();
            finalFeatureRenamedAndDeferred.name = finalFeatureName;
            finalFeatureRenamedAndDeferred.isDeferred = newIsDeferred;
            uniqueFeatures.get(finalFeatureName).set(finalFeature.identity, finalFeatureRenamedAndDeferred);
            precursors.push(finalFeatureRenamedAndDeferred);
          }

          //Array.prototype.push.apply(inheritedFeatures, );
        });
      }
    });

    // gathered precursors
    var precursorsByName = eiffel.util.group(precursors, function(feature: sym.FeatureSymbol) {
      return feature.name;
    });

    var mergedPrecursors = new Map<string, sym.FeatureSymbol>();
    precursorsByName.forEach(function (precursorsWithSameName, name) {
      if (precursorsWithSameName.length == 1) {
        mergedPrecursors.set(name, precursorsWithSameName[0]);
      }
      else {

      }
    });

    console.log(precursors);
  }

  function initAdaptions(context: AnalysisContext) {
    var parents = context.astDictionary.get(eiffel.ast.Parent);
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
      feature.identity = feature;
    });
  }


  function initReturnTypeTypeInstances(analysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.declaredFeatures.forEach(function (fSym:eiffel.symbols.FeatureSymbol) {
        if (!fSym.isCommand) {
          fSym.typeInstance = makeTypeInstanceIn(classSymbol, fSym.ast.rawType, analysisContext);
        }
      });
    });
  }

  function initParameters(analysisContext: AnalysisContext) {
    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.declaredRoutines.forEach(function (routineSym) {
        var paramNames = new Set<string>();
        var ast = <eiffel.ast.Routine> routineSym.ast;
        ast.parameters.forEach(function (varDeclList) {
          varDeclList.varDecls.forEach(function (varDeclEntry) {
            var paramName = varDeclEntry.name.name;
            if (paramNames.has(paramName)) {
              analysisContext.errors.uncategorized("VREG?? Duplicate argument name");
            }
            paramNames.add(paramName);
            varDeclEntry.sym = new eiffel.symbols.VariableSymbol(paramName, varDeclEntry, makeTypeInstanceIn(classSymbol, varDeclList.rawType, analysisContext));
            routineSym.parameters.push(varDeclEntry.sym);
            routineSym.parametersByName.set(paramName, varDeclEntry.sym);
          });
        });
      });
    });
  }

  export function analyze(...manyAsts: ast.Class[][]): AnalysisResult {
    var parse = function parse(builtinSource: BuiltinSource) {
      try {
        return eiffel.parser.parse(builtinSource.content)
      }
      catch (e) {
        parseError(builtinSource, e);
        throw e;
      }
    };
    Array.prototype.push.apply(manyAsts, __eiffel_builtin.map(parse));
    var asts: ast.Class[] = Array.prototype.concat.apply([], manyAsts);
    var analysisContext = new AnalysisContext();
    createClassSymbols(asts, analysisContext);
    initGenericParamSyms(analysisContext);
    initAstDictionary(analysisContext);
    initAstDictionaryByClass(analysisContext);
    createFeatureSymbols(analysisContext);
    createRoutineLocalSymbols(analysisContext);
    initParameters(analysisContext);
    checkCyclicInheritance(analysisContext);
    initParentTypeInstancesAndValidate(analysisContext);
    initReturnTypeTypeInstances(analysisContext);
    // Can now use traverseInheritance
    traverseInheritance(populateAncestorTypes, analysisContext);
    initAdaptions(analysisContext);
    checkValidty_8_6_13_parent_rule(analysisContext);
    initAny(analysisContext);
    traverseInheritance(inheritFeatures, analysisContext);



    analysisContext.allClasses.forEach(function (oneClass) {
      oneClass.ast.parentGroups.forEach(function (parentGroup) {
        parentGroup.parents.forEach(function (parent ) {
          validateTypeInstance(parent.parentSymbol.parentType, analysisContext);
        });
      })
    });




        handDownFeatures(analysisContext);

    analysisContext.allClasses.forEach(function (classSymbol) {
      classSymbol.ast.creationClause.forEach(function (identifier) {
        var name: string = identifier.name;
        if (classSymbol.declaredProcedures.has(name)) {
          classSymbol.creationProcedures.set(name, classSymbol.declaredProcedures.get(name));
        }
        else if (classSymbol.declaredFunctions.has(name)) {
            analysisContext.errors.uncategorized("Functions cannot be used as creation procedures " + name);
        }
        else {
          analysisContext.errors.uncategorized("There is no procedure with name " + name);
        }
      })
    });



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
      else {
        throw new Error("There is no class with name: " + name);
      }
    }

    hasClass(name: string): boolean {
      var lowerCaseName = this.redirectToSized(name).toLowerCase();
      return this.classSymbols.has(lowerCaseName);
    }

    redirectToSized(name: string): string {
      var mapping = {
        "integer": "INTEGER_32",
        "character": "CHARACTER_32",
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
      this.add(SemanticErrorKind.UnknownSourceFeatureInRename, parentClassName + " has no feature " + rename.oldName.name + ". You told Eiffel to inherit a feature named '" + rename.oldName.name + "' from a class called '" + parentClassName + "' under a new name.");
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
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen, attrClone);

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
        var sym = new symbols.FunctionSymbol(lcFunctionName, alias, fna.frozen, funcClone);

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
        var sym = new symbols.ProcedureSymbol(procedureName, alias, fna.frozen, procClone);

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
        var attributeSymbol = new symbols.AttributeSymbol(name, alias, fna.frozen, attrClone);

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
}
