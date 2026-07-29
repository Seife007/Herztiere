import { LegalPage } from '../components/LegalPage'

export function Impressum() {
  return (
    <LegalPage title="Impressum">
      <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">
        <strong>Platzhalter:</strong> Diese Seite enthält noch keine echten Angaben und ersetzt keine Rechtsberatung.
        Vor dem Betrieb der App müssen die eckig geklammerten Felder durch die tatsächlichen Angaben ersetzt und die
        Angaben mit einer fachkundigen Person (z. B. Anwält:in oder Impressum-Generator für Österreich) abgeglichen
        werden.
      </p>

      <section>
        <h2>Medieninhaber:in &amp; Betreiber:in</h2>
        <p>
          [Platzhalter: Vor- und Nachname bzw. Firmenname]
          <br />
          [Platzhalter: Straße und Hausnummer]
          <br />
          [Platzhalter: PLZ und Ort], Österreich
        </p>
      </section>

      <section>
        <h2>Kontakt</h2>
        <p>
          E-Mail: [Platzhalter: Kontakt-E-Mail-Adresse]
          <br />
          Telefon: [Platzhalter: optional]
        </p>
      </section>

      <section>
        <h2>Unternehmensgegenstand</h2>
        <p>
          Bereitstellung einer nicht-kommerziellen Informationsplattform zu Fundtieren der Stadt Wien auf Basis
          offener Daten (data.gv.at, CC BY 4.0). Die App vermittelt selbst keine Tiere – siehe{' '}
          <a href="/nutzungsbedingungen" className="text-coral-600 underline">
            Nutzungsbedingungen
          </a>
          .
        </p>
        <p className="mt-2">
          UID-Nummer: [Platzhalter: nur falls unternehmerisch betrieben, sonst entfällt dieser Punkt]
        </p>
      </section>

      <section>
        <h2>Redaktionelle Verantwortung (Mediengesetz)</h2>
        <p>
          Für den Inhalt dieser Website verantwortlich: [Platzhalter: siehe Medieninhaber:in oben]. Es handelt sich
          um keine journalistische oder redaktionelle Berichterstattung, sondern um die automatisierte Anzeige
          öffentlicher Behördendaten sowie statischer Informationsseiten.
        </p>
      </section>

      <section>
        <h2>Haftungsausschluss</h2>
        <p>
          Die dargestellten Tierdaten stammen von einer externen offenen Datenquelle (Stadt Wien) und werden
          automatisiert übernommen; für ihre Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr
          übernommen. Für Inhalte verlinkter externer Seiten ist ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>
    </LegalPage>
  )
}
