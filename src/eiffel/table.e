note
  description: "Containers whose items are accessible through keys"
  library: "Free implementation of ELKS library"
  legal: "See notice at end of class."
  status: "See notice at end of class."
  names: table, access;
  access: key, membership;
  contents: generic;
  date: "$Date: 2012-05-23 21:13:10 -0700 (Wed, 23 May 2012) $"
  revision: "$Revision: 91981 $"

deferred class TABLE [G, H] inherit

  BAG [G]
    rename
      put as bag_put
    end

feature -- Access

  item alias "[]", at alias "@" (k: H): G assign force
      -- Entry of key `k'.
    require
      valid_key: valid_key (k)
    deferred
    end

feature -- Status report

  valid_key (k: H): BOOLEAN
      -- Is `k' a valid key?
    deferred
    end

feature -- Element change

  put (v: G; k: H)
      -- Associate value `v' with key `k'.
    require
      valid_key: valid_key (k)
    deferred
    end

  force (v: G; k: H)
      -- Associate value `v' with key `k'.
    require
      valid_key: valid_key (k)
    deferred
    ensure
      inserted: item (k) = v
    end

feature {NONE} -- Inapplicable

  bag_put (v: G)
    do
    end

note
  copyright: "Copyright (c) 1984-2012, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"

end
