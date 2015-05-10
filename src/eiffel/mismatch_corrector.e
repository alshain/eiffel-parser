note
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

class
  MISMATCH_CORRECTOR

feature -- Correction

  correct_mismatch
      -- Attempt to correct object mismatch using `mismatch_information'.
    local
      l_msg: STRING
      l_exc: EXCEPTIONS
    do
        -- If it is not redefined then we raise an exception.
      create l_msg.make_from_string ("Mismatch: ")
      create l_exc
      l_msg.append (generating_type)
      l_exc.raise_retrieval_exception (l_msg)
    end

  mismatch_information: MISMATCH_INFORMATION
      -- Original attribute values of mismatched object
    once
      create Result
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"


end
