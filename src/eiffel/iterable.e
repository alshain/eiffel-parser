note
  description: "Structure that can be iterated over using `across...loop...end'."
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

deferred class
  ITERABLE [G]

feature -- Access

  new_cursor: ITERATION_CURSOR [G]
      -- Fresh cursor associated with current structure
    deferred
    ensure
      result_attached: Result /= Void
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
