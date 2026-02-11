module.exports = async (req, res) => {
  try {
    console.log("Request received:", req.query);

    // Extract query parameters
    const { direction, timestamp } = req.query;

    // Default to safe values if missing
    const safeDirection = typeof direction === "string" ? direction : "";
    const safeTimestamp = parseInt(timestamp);

    if (!safeDirection) {
      return res.status(400).json({ error: "Missing direction" });
    }

    if (isNaN(safeTimestamp)) {
      // If timestamp is invalid, use current time
      console.warn("Invalid or missing timestamp, using current time");
    }

    // Use current time if timestamp is missing/invalid
    const now = isNaN(safeTimestamp) ? Math.floor(Date.now() / 1000) : safeTimestamp;
    const date = new Date(now * 1000);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    // Bus schedule
    const schedule = {
      AtoB: {
        "33": ["15:55", "16:10", "16:40"],
        "42": ["15:20", "16:00"]
      },
      BtoA: {
        "33": ["16:05", "16:30"],
        "42": ["15:40", "16:20"]
      }
    };

    const selected = schedule[safeDirection];
    if (!selected) {
      return res.status(400).json({ error: "Invalid direction" });
    }

    const result = [];

    // Loop safely through schedule
    for (const bus in selected) {
      const times = selected[bus];
      if (!Array.isArray(times)) continue;

      for (const time of times) {
        const [h, m] = time.split(":").map(Number);
        if (isNaN(h) || isNaN(m)) continue; // Skip invalid times

        const depMinutes = h * 60 + m;
        if (depMinutes > currentMinutes) {
          const diff = depMinutes - currentMinutes;
          result.push(`${bus}   ${time}     in ${diff} minutes`);
        }
      }
    }

    // Sort results by minutes until departure
    result.sort((a, b) => {
      const minutesA = parseInt(a.split("in ")[1]) || 0;
      const minutesB = parseInt(b.split("in ")[1]) || 0;
      return minutesA - minutesB;
    });

    // Always return an array, even if empty
    return res.status(200).json({
      cas: now,
      departures: result.slice(0, 3)
    });

  } catch (err) {
    // Catch any unexpected error
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};