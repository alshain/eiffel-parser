note
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

deferred class

  NUMERIC

inherit
  DEBUG_OUTPUT
    rename
      debug_output as out
    end

feature -- Access

  one: like Current
      -- Neutral element for "*" and "/"
    deferred
    ensure
      result_exists: Result /= Void
    end

  zero: like Current
      -- Neutral element for "+" and "-"
    deferred
    ensure
      result_exists: Result /= Void
    end

feature -- Status report

  divisible (other: like Current): BOOLEAN
      -- May current object be divided by `other'?
    require
      other_exists: other /= Void
    deferred
    end

  exponentiable (other: NUMERIC): BOOLEAN
      -- May current object be elevated to the power `other'?
    obsolete
      "[2008_04_01] Will be removed since not used."
    require
      other_exists: other /= Void
    deferred
    end

feature -- Basic operations

  plus alias "+" (other: like Current): like Current
      -- Sum with `other' (commutative).
    require
      other_exists: other /= Void
    deferred
    ensure
      result_exists: Result /= Void
      commutative: Result ~ (other + Current)
    end

  minus alias "-" (other: like Current): like Current
      -- Result of subtracting `other'
    require
      other_exists: other /= Void
    deferred
    ensure
      result_exists: Result /= Void
    end

  product alias "*" (other: like Current): like Current
      -- Product by `other'
    require
      other_exists: other /= Void
    deferred
    ensure
      result_exists: Result /= Void
    end

  quotient alias "/" (other: like Current): like Current
      -- Division by `other'
    require
      other_exists: other /= Void
      good_divisor: divisible (other)
    deferred
    ensure
      result_exists: Result /= Void
    end

  identity alias "+": like Current
      -- Unary plus
    deferred
    ensure
      result_exists: Result /= Void
    end

  opposite alias "-": like Current
      -- Unary minus
    deferred
    ensure
      result_exists: Result /= Void
    end

invariant

--  neutral_addition: equal (Current + zero, Current);
--  self_subtraction: equal (Current - Current, zero);
--  neutral_multiplication: equal (Current * one, Current);
--  self_division: divisible (Current) implies equal (Current / Current, one)

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
