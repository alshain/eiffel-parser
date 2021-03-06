note
  description: "[
    Objects representing delayed calls to a routine,
    with some operands possibly still open
    ]"
  library: "Free implementation of ELKS library"
  status: "See notice at end of class."
  legal: "See notice at end of class."
  date: "$Date: 2014-01-28 14:35:23 -0800 (Tue, 28 Jan 2014) $"
  revision: "$Revision: 94109 $"

deferred class
  ROUTINE [BASE_TYPE -> detachable ANY, OPEN_ARGS -> detachable TUPLE create default_create end]

inherit
  HASHABLE
    redefine
      copy,
      is_equal
    end

  REFLECTOR
    export
      {NONE} all
    redefine
      copy,
      is_equal
    end

feature -- Initialization

  adapt (other: like Current)
      -- Initialize from `other'.
      -- Useful in descendants.
    require
      other_exists: other /= Void
      conforming: conforms_to (other)
    do
      rout_disp := other.rout_disp
      encaps_rout_disp := other.encaps_rout_disp
      calc_rout_addr := other.calc_rout_addr
      closed_operands := other.closed_operands
      operands := other.operands
      routine_id := other.routine_id
      is_basic := other.is_basic
      is_target_closed := other.is_target_closed
      written_type_id_inline_agent := other.written_type_id_inline_agent
      open_count := other.open_count
    end

feature -- Access

  frozen operands: detachable OPEN_ARGS

  target: detachable ANY
      -- Target of call
    local
      c: like closed_operands
    do
        -- Because a target object is never separate relative to the routine object,
        -- the first argument is checked against {ANY} rather than {separate ANY}.
      if is_target_closed then
        c := closed_operands
        if c /= Void and then c.count > 0 and then attached {ANY} c.item (1) as r then
          Result := r
        end
      elseif attached {TUPLE} operands as o and then o.count > 0 and then attached {ANY} o.item (1) as r then
        Result := r
      end
    end

  hash_code: INTEGER
      -- Hash code value.
    do
      Result := rout_disp.hash_code.bit_xor (routine_id.hash_code)
    end

  precondition (args: like operands): BOOLEAN
      -- Do `args' satisfy routine's precondition
      -- in current state?
    do
      Result := True
      --| FIXME compiler support needed!
    end

  postcondition (args: like operands): BOOLEAN
      -- Does current state satisfy routine's
      -- postcondition for `args'?
    do
      Result := True
      --| FIXME compiler support needed!
    end

  empty_operands: attached OPEN_ARGS
      -- Empty tuple matching open operands.
    obsolete "This function will be removed as non-void-safe. [22.07.2013]"
    do
      create Result
    ensure
      empty_operands_not_void: Result /= Void
    end

feature -- Status report

  callable: BOOLEAN = True
      -- Can routine be called on current object?

  is_equal (other: like Current): BOOLEAN
      -- Is associated routine the same as the one
      -- associated with `other'.
    do
      --| Do not compare implementation data
      Result := closed_operands ~ other.closed_operands
        and then operands ~ other.operands
        and then open_map ~ other.open_map
        and then (rout_disp = other.rout_disp)
        and then (routine_id = other.routine_id)
        and then (written_type_id_inline_agent = other.written_type_id_inline_agent)
        and then (encaps_rout_disp = other.encaps_rout_disp)
        and then (calc_rout_addr = other.calc_rout_addr)
    end

  valid_operands (args: detachable separate TUPLE): BOOLEAN
      -- Are `args' valid operands for this routine?
    local
      i, arg_type_code: INTEGER
      arg: like {TUPLE}.item
      open_type_codes: STRING
      l_type: INTEGER
    do
      if args = Void then
          -- Void operands are only allowed
          -- if object has no open operands.
        Result := (open_count = 0)
      elseif args.count >= open_count then
        from
          Result := True
          open_type_codes := eif_gen_typecode_str ($Current)
          i := 1
        until
          i > open_count or not Result
        loop
          arg_type_code := args.item_code (i)
          Result := arg_type_code = open_type_codes.item (i + 1).code
          if Result and then arg_type_code = {TUPLE}.reference_code then
            arg := args.item (i)
            l_type := open_operand_type (i)
              -- If expected type is attached, then we need to verify that the actual
              -- is indeed attached.
            if is_attached_type (l_type) then
              Result := arg /= Void and then
                field_conforms_to (type_id_of (arg), l_type)
            else
              Result := arg = Void or else
                field_conforms_to (type_id_of (arg), l_type)
            end
          end
          i := i + 1
        end
      end
      if Result and then not is_target_closed and then args /= Void then
        Result := args.item (1) /= Void
      end
    end

  valid_target (args: detachable TUPLE): BOOLEAN
      -- Is the first element of tuple `args' a valid target
    do
      if args /= Void and then args.count > 0 then
        if args.is_reference_item (1) then
          Result := args.reference_item (1) /= Void
        else
          Result := True
        end
      end
    end

  is_target_closed: BOOLEAN
      -- Is target for current agent closed, i.e. specified at creation time?

feature -- Measurement

  open_count: INTEGER
      -- Number of open operands.

feature -- Settings

  frozen set_operands (args: detachable OPEN_ARGS)
      -- Use `args' as operands for next call.
    require
      valid_operands: valid_operands (args)
    do
      operands := args
    ensure
      operands_set: (operands /= Void implies (operands ~ args)) or
        (operands = Void implies (args = Void or else args.is_empty))
    end

  set_target (a_target: like target)
      -- Set `a_target' as the next `target' for remaining calls to Current.
    require
      a_target_not_void: a_target /= Void
      is_target_closed: is_target_closed
      target_not_void: target /= Void
      same_target_type: attached target as t and then t.same_type (a_target)
    local
      c: like closed_operands
    do
      c := closed_operands
      if c /= Void then
        c.put (a_target, 1)
      end
    ensure
      target_set: target = a_target
    end

feature -- Duplication

  copy (other: like Current)
      -- Use same routine as `other'.
    do
      if other /= Current then
        standard_copy (other)
        if attached operands as l_operands then
          operands := l_operands.twin
        end
      end
    ensure then
      same_call_status: other.callable implies callable
    end

feature -- Basic operations

  call (args: detachable separate OPEN_ARGS)
      -- Call routine with `args'.
    require
      valid_operands: valid_operands (args)
    deferred
    end

  apply
      -- Call routine with `operands' as last set.
    require
      valid_operands: valid_operands (operands)
    deferred
    end

feature -- Extended operations

  flexible_call (a: detachable separate TUPLE)
      -- Call routine with arguments `a'.
      -- Compared to `call' the type of `a' may be different from `{OPEN_ARGS}'.
    require
      valid_operands: valid_operands (a)
    local
      default_arguments: detachable OPEN_ARGS
    do
      if not attached a then
        call (default_arguments)
      else
        -- TODO implement in javascript
        -- check
        --   from_precondition: attached {OPEN_ARGS} new_tuple_from_tuple (({OPEN_ARGS}).type_id, a) as x
        -- then
        --   call (x)
        -- end
      end
    end

feature -- Obsolete

  adapt_from (other: like Current)
      -- Adapt from `other'. Useful in descendants.
    obsolete
      "Please use `adapt' instead (it's also a creation procedure)"
    require
      other_exists: other /= Void
      conforming: conforms_to (other)
    do
      adapt (other)
    end

feature {ROUTINE} -- Implementation

  frozen closed_operands: detachable TUPLE
      -- All closed arguments provided at creation time

  closed_count: INTEGER
      -- The number of closed operands (including the target if it is closed)
    local
      c: detachable TUPLE
    do
      c := closed_operands
      if c /= Void then
        Result := c.count
      end
    end

  frozen rout_disp: POINTER
      -- Routine dispatcher

  frozen calc_rout_addr: POINTER
      -- Address of the final routine

  frozen open_map: detachable ARRAY [INTEGER]
      -- Index map for open arguments

  frozen encaps_rout_disp: POINTER
      -- Eiffel routine dispatcher

  frozen routine_id: INTEGER

  frozen is_basic: BOOLEAN

  frozen written_type_id_inline_agent: INTEGER

  frozen set_rout_disp (a_rout_disp, a_encaps_rout_disp, a_calc_rout_addr: POINTER;
              a_routine_id: INTEGER; a_open_map: like open_map;
              a_is_basic, a_is_target_closed: BOOLEAN; a_written_type_id_inline_agent: INTEGER;
              a_closed_operands: TUPLE; a_open_count: INTEGER)
      -- Initialize object.
    require
      target_valid: a_is_target_closed implies valid_target (a_closed_operands)
    do
      set_rout_disp_int (a_rout_disp, a_encaps_rout_disp, a_calc_rout_addr, a_routine_id,
                 a_open_map, a_is_basic, a_is_target_closed,
                 a_written_type_id_inline_agent, a_closed_operands, a_open_count)
    end

  frozen set_rout_disp_final (a_rout_disp, a_encaps_rout_disp, a_calc_rout_addr: POINTER
                  a_closed_operands: TUPLE; a_is_target_closed: BOOLEAN; a_open_count: INTEGER)
      -- Initialize object.
    do
      rout_disp := a_rout_disp
      encaps_rout_disp := a_encaps_rout_disp
      calc_rout_addr := a_calc_rout_addr
      closed_operands := a_closed_operands
      is_target_closed := a_is_target_closed
      open_count := a_open_count
    end

  frozen set_rout_disp_int (a_rout_disp, a_encaps_rout_disp, a_calc_rout_addr: POINTER;
                  a_routine_id: INTEGER; a_open_map: like open_map;
                a_is_basic, a_is_target_closed: BOOLEAN; a_written_type_id_inline_agent: INTEGER;
                a_closed_operands: TUPLE; a_open_count: INTEGER)
      -- Initialize object.
    require
      a_routine_id_valid: a_routine_id > -1
    do
      rout_disp := a_rout_disp
      encaps_rout_disp := a_encaps_rout_disp
      calc_rout_addr := a_calc_rout_addr
      routine_id := a_routine_id
      open_map := a_open_map
      is_basic := a_is_basic
      is_target_closed := a_is_target_closed
      written_type_id_inline_agent := a_written_type_id_inline_agent
      closed_operands := a_closed_operands
      open_count := a_open_count
    ensure
      rout_disp_set: rout_disp = a_rout_disp
      encaps_rout_disp_set: encaps_rout_disp = a_encaps_rout_disp
      calc_rout_addr_set: calc_rout_addr = a_calc_rout_addr
      routine_id_set: routine_id = a_routine_id
      open_map_set: open_map = a_open_map
      is_target_closed_set: is_target_closed = a_is_target_closed
      is_basic_set: is_basic = a_is_basic
      written_type_id_inline_agent_set: written_type_id_inline_agent = a_written_type_id_inline_agent
      closed_operands_set: closed_operands = a_closed_operands
      open_count_set: open_count = a_open_count
    end

feature {NONE} -- Implementation

  frozen open_types: detachable ARRAY [INTEGER]
      -- Types of open operands

  open_operand_type (i: INTEGER): INTEGER
      -- Type of `i'th open operand.
    require
      positive: i >= 1
      within_bounds: i <= open_count
    local
      o: like open_types
    do
      o := open_types
      if o = Void then
        create o.make_filled (-1, 1, open_count)
        open_types := o
      end
      Result := o.item (i)
      if Result = -1 then
        Result := ({OPEN_ARGS}).generic_parameter_type (i).type_id
        o.put (Result, i)
      end
    end

  type_id_of (a: separate ANY): INTEGER
      -- Type ID of an object `a'.
    do
      Result := a.generating_type.type_id
    end

feature {NONE} -- Externals

  eif_gen_typecode_str (obj: POINTER): STRING
      -- Code name for generic parameter `pos' in `obj'.
    external
      "C signature (EIF_REFERENCE): EIF_REFERENCE use %"eif_gen_conf.h%""
    end

feature -- Obsolete

  arguments: detachable OPEN_ARGS
    obsolete
      "use operands"
    do
      Result := operands
    end

  set_arguments (args: detachable OPEN_ARGS)
    obsolete
      "use set_operands"
    do
      set_operands (args)
    end

  valid_arguments (args: detachable OPEN_ARGS): BOOLEAN
    obsolete
      "use valid_operands"
    do
      Result := valid_operands (args)
    end

note
  copyright: "Copyright (c) 1984-2014, Eiffel Software and others"
  license:   "Eiffel Forum License v2 (see http://www.eiffel.com/licensing/forum.txt)"
  source: "[
      Eiffel Software
      5949 Hollister Ave., Goleta, CA 93117 USA
      Telephone 805-685-1006, Fax 805-685-6869
      Website http://www.eiffel.com
      Customer support http://support.eiffel.com
    ]"

end
