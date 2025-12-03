// Excel-Export-Route: liefert alle RUNDEN aller Spiele
app.get('/api/export-excel', async (req, res) => {
  try {
    // Alle Spiele inkl. Runden laden
    const games = await Game.find().lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('All Negotiations');

    // Kopfzeile
    sheet.addRow([
      'Pair ID',
      'Group',
      'Round',
      'Proposer',
      'Offer A (€)',
      'Offer B (€)',
      'Response',
      'Timestamp',
    ]);

    // Für jedes Spiel ALLE Runden in einzelne Zeilen schreiben
    games.forEach((game) => {
      const pairId = game.pairId;
      const group = game.groupNumber;

      (game.rounds || []).forEach((round) => {
        // Proposer lesbarer machen (optional)
        const proposer =
          round.proposer === 'A'
            ? 'Person A'
            : round.proposer === 'B'
            ? 'Person B'
            : round.proposer;

        // Response lesbar machen (optional)
        let responseText = round.response;
        if (round.response === 'too_low') responseText = 'Too low - counteroffer';
        if (round.response === 'accept') responseText = 'Accept - offer accepted';
        if (round.response === 'better_offer') responseText = 'Better offer outside option';
        if (round.response === 'not_accept') responseText = 'Not accept';

        sheet.addRow([
          pairId,
          group,
          round.roundNumber,
          proposer,
          round.offerA,
          round.offerB,
          responseText,
          round.timestamp || game.createdAt,
        ]);
      });
    });

    // Download-Header setzen
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="all_games.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).send('Error generating Excel');
  }
});
