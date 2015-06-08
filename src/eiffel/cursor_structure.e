note
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: cursor_structure, access;
  access: cursor, membership;
  contents: generic;
  date: "$Date: 2012-07-23 14:02:19 -0700 (Mon, 23 Jul 2012) $"
  revision: "$Revision: 91989 $"

deferred class CURSOR_STRUCTURE [G] inherit

  ACTIVE [G]

feature -- Access

  cursor: CURSOR
      -- Current cursor position
    deferred
    ensure
      cursor_not_void: Result /= Void
    end

feature -- Status report

  valid_cursor (p: CURSOR): BOOLEAN
      -- Can the cursor be moved to position `p'?
    deferred
    end

feature -- Cursor movement

  go_to (p: CURSOR)
      -- Move cursor to position `p'.
    require
      cursor_position_valid: valid_cursor (p)
    deferred
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
