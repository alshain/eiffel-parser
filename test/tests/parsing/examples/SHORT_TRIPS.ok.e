note
  description: "Short trips."

class
  SHORT_TRIPS

inherit
  ZURICH_OBJECTS

feature -- Explore Zurich

  highlight_short_distance (s: STATION)
      -- Highlight stations reachable from `s' within 2 minutes.
    require
      station_exists: s /= Void
    do
      highlight_reachable (s, 120)
    end

feature {NONE} -- Implementation

  highlight_reachable (s: STATION; t: REAL_64)
      -- Highight stations reachable from `s' within `t' seconds.
    require
      station_exists: s /= Void
    local
      line_sequence: V_SEQUENCE [LINE]
      i: INTEGER
      s_next: STATION
      s_previous: STATION

    do

      line_sequence := zurich.station (s.name).lines
      from
        i := 1
        s_next := line_sequence [i].next_station (s, line_sequence [i].last)
        s_previous := line_sequence [i].next_station (s, line_sequence [i].first)
      until
        i = line_sequence.count
      loop
        if line_sequence [i].distance (s, s_next) / line_sequence [i].speed <= t and not line_sequence [i].is_terminal (s_next) then
          zurich_map.station_view (s_next).highlight
          if line_sequence [i].next_station (s_next, line_sequence [i].last) /= Void then
            s_next := line_sequence [i].next_station (s_next, line_sequence [i].last)
          end

          if line_sequence [i].distance (s, s_previous) / line_sequence [i].speed <= t and not line_sequence [i].is_terminal (s_previous) then
            zurich_map.station_view (s_previous).highlight
            if line_sequence [i].next_station (s_previous, line_sequence [i].last) /= Void then
              s_previous := line_sequence [i].next_station (s_previous, line_sequence [i].last)
            end
          end
        else
          i := i + 1
          if line_sequence.count >= i then
          s_next := line_sequence [i].next_station (s, line_sequence [i].last)
          s_previous := line_sequence [i].next_station (s, line_sequence [i].first)

          end
        end
      end
    end
end

