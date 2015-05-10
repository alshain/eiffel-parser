note
  description: "Objects that provide an output in debugger"
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2013-01-17 11:46:15 -0800 (Thu, 17 Jan 2013) $"
  revision: "$Revision: 92124 $"

deferred class
  DEBUG_OUTPUT

feature -- Status report

  debug_output: READABLE_STRING_GENERAL
      -- String that should be displayed in debugger to represent `Current'.
    deferred
    ensure
      result_not_void: Result /= Void
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
