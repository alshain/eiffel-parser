note
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

deferred class
  HASHABLE

feature -- Access

  hash_code: INTEGER
      -- Hash code value
    deferred
    ensure
      good_hash_value: Result >= 0
    end

feature -- Status report

  is_hashable: BOOLEAN
      -- May current object be hashed?
      -- (True by default.)
    do
      Result := True
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
