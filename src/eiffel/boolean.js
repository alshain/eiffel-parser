vees.builtin.classes.push(function(c, a, p, f) {
  c(
    "BOOLEAN",
    ["ANY"],
    // Fields
    [

    ],
    // Functions
    [
      f("conjuncted", ["other", "BOOLEAN"], "BOOLEAN", "and"),
      f("conjuncted_semistrict", ["other", "BOOLEAN"], "BOOLEAN", "and then"),
      f("implication", ["other", "BOOLEAN"], "BOOLEAN", "implies"),
      f("negated", [], "BOOLEAN", "not"),
      f("disjuncted", ["other", "BOOLEAN"], "BOOLEAN", "or"),
      f("disjuncted_semistrict", ["other", "BOOLEAN"], "BOOLEAN", "or else"),
      f("disjuncted_exclusive", ["other", "BOOLEAN"], "BOOLEAN", "or xor"),
    ],
    // Procedures:
    [

    ],
    // Constants
    [

    ]
  );

});
