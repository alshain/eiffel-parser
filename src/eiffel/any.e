class
  ANY

feature -- Status report

  conforms_to (other: ANY): BOOLEAN
      -- Does type of current object conform to type
      -- of `other' (as per Eiffel: The Language, chapter 13)?
    require
      other_not_void: other /= Void
    external
      "built_in"
    end

  same_type (other: ANY): BOOLEAN
      -- Is type of current object identical to type of `other'?
    require
      other_not_void: other /= Void
    external
      "built_in"
    ensure
      definition: Result = (conforms_to (other) and
                    other.conforms_to (Current))
    end

feature -- Comparison

  is_equal (other: like Current): BOOLEAN
      -- Is `other' attached to an object considered
      -- equal to current object?
    require
      other_not_void: other /= Void
    external
      "built_in"
    ensure
      symmetric: Result implies other ~ Current
      consistent: standard_is_equal (other) implies Result
    end

  frozen standard_is_equal (other: like Current): BOOLEAN
      -- Is `other' attached to an object of the same type
      -- as current object, and field-by-field identical to it?
    require
      other_not_void: other /= Void
    external
      "built_in"
    ensure
      same_type: Result implies same_type (other)
      symmetric: Result implies other.standard_is_equal (Current)
    end

  frozen equal (a: detachable ANY; b: like a): BOOLEAN
      -- Are `a' and `b' either both void or attached
      -- to objects considered equal?
    do
      if a = Void then
        Result := b = Void
      else
        Result := b /= Void and then
              a.is_equal (b)
      end
    ensure
      definition: Result = (a = Void and b = Void) or else
            ((a /= Void and b /= Void) and then
            a.is_equal (b))
    end

  frozen standard_equal (a: detachable ANY; b: like a): BOOLEAN
      -- Are `a' and `b' either both void or attached to
      -- field-by-field identical objects of the same type?
      -- Always uses default object comparison criterion.
    do
      if a = Void then
        Result := b = Void
      else
        Result := b /= Void and then
              a.standard_is_equal (b)
      end
    ensure
      definition: Result = (a = Void and b = Void) or else
            ((a /= Void and b /= Void) and then
            a.standard_is_equal (b))
    end

  frozen is_deep_equal (other: like Current): BOOLEAN
      -- Are `Current' and `other' attached to isomorphic object structures?
    require
      other_not_void: other /= Void
    external
      "built_in"
    ensure
      shallow_implies_deep: standard_is_equal (other) implies Result
      same_type: Result implies same_type (other)
      symmetric: Result implies other.is_deep_equal (Current)
    end

  frozen deep_equal (a: detachable ANY; b: like a): BOOLEAN
      -- Are `a' and `b' either both void
      -- or attached to isomorphic object structures?
    do
      if a = Void then
        Result := b = Void
      else
        Result := b /= Void and then a.is_deep_equal (b)
      end
    ensure
      shallow_implies_deep: standard_equal (a, b) implies Result
      both_or_none_void: (a = Void) implies (Result = (b = Void))
      same_type: (Result and (a /= Void)) implies (b /= Void and then a.same_type (b))
      symmetric: Result implies deep_equal (b, a)
    end

feature -- Output

  io: STD_FILES
      -- Handle to standard file setup
    external
      "built_in"
    ensure
      io_not_void: Result /= Void
    end

  out: STRING
      -- New string containing terse printable representation
      -- of current object
    do
      Result := tagged_out
    ensure
      out_not_void: Result /= Void
    end

  frozen tagged_out: STRING
      -- New string containing terse printable representation
      -- of current object
    external
      "built_in"
    ensure
      tagged_out_not_void: Result /= Void
    end

  print (o: detachable ANY)
      -- Write terse external representation of `o'
      -- on standard output.
    do
      if o /= Void then
        io.put_string (o.out)
      end
    end

feature {NONE} -- Initialization

  default_create
      -- Process instances of classes with no creation clause.
      -- (Default: do nothing.)
    do
    end

feature -- Basic operations
  frozen dlo_nothing
      -- Execute a null action.
    do
    end

invariant
  reflexive_equality: standard_is_equal (Current)
  reflexive_conformance: conforms_to (Current)


end
