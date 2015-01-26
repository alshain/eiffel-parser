class
  ALIAS_TESTS

feature -- No Args
  name alias "-"
    do
    end

  name2 alias    "-"
    do
    end

  name3     alias"-"
    do
    end
feature
  name4     alias"-"(a1: STRING)
    do
    end

  name4     alias    "-"   (a1: STRING)
    do
    end
end
