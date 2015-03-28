
vees.builtin.classes.push(function(c, a, p, f) {
  c("ANY", null,
    // Fields
    [
      a("Io", "STD_FILES"),
    ],
    // Functions
    {  },
    // Procedures:
    {  },
    // Constants
    {  }
  );

});

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

vees.builtin.classes.push(function(c, a, p, f) {
  c(
    "INTEGER",
    ["ANY"],
    // Fields
    [

    ],
    // Functions
    [

    ],
    // Procedures:
    [

    ],
    // Constants
    [

    ]
  );

});

vees.builtin.classes.push(function(c, a, p, f) {
  c(
    "STD_FILES",
    ["ANY"],
    // Fields
    [

    ],
    // Functions
    [

    ],
    // Procedures:
    [
      p("put_string", {s: "STRING"}, function(ctx, s) {
        //this.r("standard_default").f()

      }),

    ],
    // Constants
    [

    ]
  );

});

vees.builtin.classes.push(function(c, a, p, f) {
  c(
    "STRING",
    ["ANY"],
    // Fields
    [

    ],
    // Functions
    [

    ],
    // Procedures:
    [

    ],
    // Constants
    [

    ]
  );

});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFueS5qcyIsImJvb2xlYW4uanMiLCJpbnRlZ2VyLmpzIiwic3RkX2ZpbGVzLmpzIiwic3RyaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVpbHRpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxudmVlcy5idWlsdGluLmNsYXNzZXMucHVzaChmdW5jdGlvbihjLCBhLCBwLCBmKSB7XG4gIGMoXCJBTllcIiwgbnVsbCxcbiAgICAvLyBGaWVsZHNcbiAgICBbXG4gICAgICBhKFwiSW9cIiwgXCJTVERfRklMRVNcIiksXG4gICAgXSxcbiAgICAvLyBGdW5jdGlvbnNcbiAgICB7ICB9LFxuICAgIC8vIFByb2NlZHVyZXM6XG4gICAgeyAgfSxcbiAgICAvLyBDb25zdGFudHNcbiAgICB7ICB9XG4gICk7XG5cbn0pO1xuIiwidmVlcy5idWlsdGluLmNsYXNzZXMucHVzaChmdW5jdGlvbihjLCBhLCBwLCBmKSB7XG4gIGMoXG4gICAgXCJCT09MRUFOXCIsXG4gICAgW1wiQU5ZXCJdLFxuICAgIC8vIEZpZWxkc1xuICAgIFtcblxuICAgIF0sXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgW1xuICAgICAgZihcImNvbmp1bmN0ZWRcIiwgW1wib3RoZXJcIiwgXCJCT09MRUFOXCJdLCBcIkJPT0xFQU5cIiwgXCJhbmRcIiksXG4gICAgICBmKFwiY29uanVuY3RlZF9zZW1pc3RyaWN0XCIsIFtcIm90aGVyXCIsIFwiQk9PTEVBTlwiXSwgXCJCT09MRUFOXCIsIFwiYW5kIHRoZW5cIiksXG4gICAgICBmKFwiaW1wbGljYXRpb25cIiwgW1wib3RoZXJcIiwgXCJCT09MRUFOXCJdLCBcIkJPT0xFQU5cIiwgXCJpbXBsaWVzXCIpLFxuICAgICAgZihcIm5lZ2F0ZWRcIiwgW10sIFwiQk9PTEVBTlwiLCBcIm5vdFwiKSxcbiAgICAgIGYoXCJkaXNqdW5jdGVkXCIsIFtcIm90aGVyXCIsIFwiQk9PTEVBTlwiXSwgXCJCT09MRUFOXCIsIFwib3JcIiksXG4gICAgICBmKFwiZGlzanVuY3RlZF9zZW1pc3RyaWN0XCIsIFtcIm90aGVyXCIsIFwiQk9PTEVBTlwiXSwgXCJCT09MRUFOXCIsIFwib3IgZWxzZVwiKSxcbiAgICAgIGYoXCJkaXNqdW5jdGVkX2V4Y2x1c2l2ZVwiLCBbXCJvdGhlclwiLCBcIkJPT0xFQU5cIl0sIFwiQk9PTEVBTlwiLCBcIm9yIHhvclwiKSxcbiAgICBdLFxuICAgIC8vIFByb2NlZHVyZXM6XG4gICAgW1xuXG4gICAgXSxcbiAgICAvLyBDb25zdGFudHNcbiAgICBbXG5cbiAgICBdXG4gICk7XG5cbn0pO1xuIiwidmVlcy5idWlsdGluLmNsYXNzZXMucHVzaChmdW5jdGlvbihjLCBhLCBwLCBmKSB7XG4gIGMoXG4gICAgXCJJTlRFR0VSXCIsXG4gICAgW1wiQU5ZXCJdLFxuICAgIC8vIEZpZWxkc1xuICAgIFtcblxuICAgIF0sXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgW1xuXG4gICAgXSxcbiAgICAvLyBQcm9jZWR1cmVzOlxuICAgIFtcblxuICAgIF0sXG4gICAgLy8gQ29uc3RhbnRzXG4gICAgW1xuXG4gICAgXVxuICApO1xuXG59KTtcbiIsInZlZXMuYnVpbHRpbi5jbGFzc2VzLnB1c2goZnVuY3Rpb24oYywgYSwgcCwgZikge1xuICBjKFxuICAgIFwiU1REX0ZJTEVTXCIsXG4gICAgW1wiQU5ZXCJdLFxuICAgIC8vIEZpZWxkc1xuICAgIFtcblxuICAgIF0sXG4gICAgLy8gRnVuY3Rpb25zXG4gICAgW1xuXG4gICAgXSxcbiAgICAvLyBQcm9jZWR1cmVzOlxuICAgIFtcbiAgICAgIHAoXCJwdXRfc3RyaW5nXCIsIHtzOiBcIlNUUklOR1wifSwgZnVuY3Rpb24oY3R4LCBzKSB7XG4gICAgICAgIC8vdGhpcy5yKFwic3RhbmRhcmRfZGVmYXVsdFwiKS5mKClcblxuICAgICAgfSksXG5cbiAgICBdLFxuICAgIC8vIENvbnN0YW50c1xuICAgIFtcblxuICAgIF1cbiAgKTtcblxufSk7XG4iLCJ2ZWVzLmJ1aWx0aW4uY2xhc3Nlcy5wdXNoKGZ1bmN0aW9uKGMsIGEsIHAsIGYpIHtcbiAgYyhcbiAgICBcIlNUUklOR1wiLFxuICAgIFtcIkFOWVwiXSxcbiAgICAvLyBGaWVsZHNcbiAgICBbXG5cbiAgICBdLFxuICAgIC8vIEZ1bmN0aW9uc1xuICAgIFtcblxuICAgIF0sXG4gICAgLy8gUHJvY2VkdXJlczpcbiAgICBbXG5cbiAgICBdLFxuICAgIC8vIENvbnN0YW50c1xuICAgIFtcblxuICAgIF1cbiAgKTtcblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=