note
  description: "Structures with a finite item count"
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: finite, storage;
  date: "$Date: 2012-07-23 14:02:19 -0700 (Mon, 23 Jul 2012) $"
  revision: "$Revision: 91989 $"

deferred class FINITE [G] inherit

  BOX [G]

feature -- Measurement

  count: INTEGER
      -- Number of items
    deferred
    ensure
      count_non_negative: Result >= 0
    end

feature -- Status report

  is_empty: BOOLEAN
      -- Is structure empty?
    do
      Result := (count = 0)
    end

invariant
  empty_definition: is_empty = (count = 0)

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
