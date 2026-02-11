module.exports = (req, res) => {
  try {
    const { direction, timestamp } = req.query;

    if (!direction || !timestamp) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const now = parseInt(timestamp);
    const date = new Date(now * 1000);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

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

    const selected = schedule[direction];
    if (!selected) {
      return res.status(400).json({ error: "Invalid direction" });
    }

    const result = [];

    for (const bus in selected) {
      for (const time of selected[bus]) {
        const [h, m] = time.split(":").map(Number);
        const depMinutes = h * 60 + m;

        if (depMinutes > currentMinutes) {
          const diff = depMinutes - currentMinutes;
          result.push(`${bus}   ${time}     in ${diff} minutes`);
        }
      }
    }

    result.sort();

    return res.status(200).json({
      cas: timestamp,
      departures: result.slice(0, 3)
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};