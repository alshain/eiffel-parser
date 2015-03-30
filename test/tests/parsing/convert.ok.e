expanded class INTEGER_32 inherit

  INTEGER_32_REF
    redefine
      is_less,
      plus,
      minus,
      product,
      quotient,
      power,
      integer_quotient,
      integer_remainder,
      opposite,
      identity,
      asa_natural_8,
      as_natural_16,
      as_natural_32,
      as_natural_64,
      as_integer_8,
      as_integer_16,
      as_integer_32,
      as_integer_64,
      to_real,
      to_double,
      to_character_8,
      to_character_32,
      bit_and,
      bit_or,
      bit_xor,
      bit_not,
      bit_shift_left,
      bit_shift_right
    end

create
  default_create,
  make_from_reference

convert
  make_from_reference ({INTEGER_32_REF}),
  to_real: {REAL_32},
  to_double: {REAL_64},
  to_integer_64: {INTEGER_64}

end
