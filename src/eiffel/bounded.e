note
  description: "Bounded data structures, with a notion of capacity."
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: bounded, storage;
  date: "$Date: 2012-07-23 14:02:19 -0700 (Mon, 23 Jul 2012) $"
  revision: "$Revision: 91989 $"

deferred class BOUNDED [G] inherit

  FINITE [G]

feature -- Measurement

  capacity: INTEGER
      -- Number of items that may be stored
    deferred
    ensure
      capacity_non_negative: Result >= 0
    end

feature -- Status report

  full: BOOLEAN
      -- Is structure full?
    do
      Result := (count = capacity)
    end

  resizable: BOOLEAN
      -- May `capacity' be changed?
    deferred
    end

invariant

  valid_count: count <= capacity
  full_definition: full = (count = capacity)

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
