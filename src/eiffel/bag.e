note
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: bag, access;
  access: membership;
  contents: generic;
  date: "$Date: 2012-07-23 14:02:19 -0700 (Mon, 23 Jul 2012) $"
  revision: "$Revision: 91989 $"

deferred class BAG [G] inherit

  COLLECTION [G]
    redefine
      extend
    end

feature -- Measurement

  occurrences (v: G): INTEGER
      -- Number of times `v' appears in structure
      -- (Reference or object equality,
      -- based on `object_comparison'.)
    deferred
    ensure
      non_negative_occurrences: Result >= 0
    end

feature -- Element change

  extend (v: G)
      -- Add a new occurrence of `v'.
    deferred
    ensure then
        -- Commented due to the expensive nature of the check when inserting a new item
        -- in a containers with many items.
      -- one_more_occurrence: occurrences (v) = old (occurrences (v)) + 1
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
