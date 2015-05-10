note
  description: "Objects that may be compared according to a partial order relation"
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

deferred class
  PART_COMPARABLE

feature -- Comparison

  is_less alias "<" (other: like Current): BOOLEAN
      -- Is current object less than `other'?
    require
      other_exists: other /= Void
    deferred
    end

  is_less_equal alias "<=" (other: like Current): BOOLEAN
      -- Is current object less than or equal to `other'?
    require
      other_exists: other /= Void
    do
      Result := (Current < other) or (Current ~ other)
    end

  is_greater alias ">" (other: like Current): BOOLEAN
      -- Is current object greater than `other'?
    require
      other_exists: other /= Void
    do
      Result := other < Current
    end

  is_greater_equal alias ">=" (other: like Current): BOOLEAN
      -- Is current object greater than or equal to `other'?
    require
      other_exists: other /= Void
    do
      Result := (other < Current) or (Current ~ other)
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
