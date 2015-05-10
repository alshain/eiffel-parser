note
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: storage;
  date: "$Date: 2012-07-23 14:02:19 -0700 (Mon, 23 Jul 2012) $"
  revision: "$Revision: 91989 $"

deferred class BOX [G] inherit

  CONTAINER [G]

feature -- Status report

  full: BOOLEAN
      -- Is structure filled to capacity?
    deferred
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"
end
