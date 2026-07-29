import { LegalPage } from '../components/LegalPage'

export function Nutzungsbedingungen() {
  return (
    <LegalPage title="Nutzungsbedingungen">
      <section>
        <h2>Was diese App ist – und was nicht</h2>
        <p>
          herztiere zeigt öffentliche Fundtier-Daten der Stadt Wien (data.gv.at, Lizenz CC BY 4.0) in einer
          Swipe-Ansicht an. <strong>herztiere vermittelt selbst keine Tiere.</strong> Die App ist ausschließlich eine
          Informationsplattform, die bestehende offene Daten übersichtlich darstellt.
        </p>
      </section>

      <section>
        <h2>Kontaktaufnahme und Vermittlung</h2>
        <p>
          Die eigentliche Kontaktaufnahme und Vermittlung erfolgt ausschließlich über die auf der jeweiligen
          Tierdetailseite genannte zuständige Stelle (z. B. TierQuarTier Wien) – <strong>nicht</strong> über
          herztiere. Wir sind an einer etwaigen Vermittlung nicht beteiligt und übernehmen dafür keine
          Verantwortung.
        </p>
      </section>

      <section>
        <h2>Keine Gewähr für die Tierdaten</h2>
        <p>
          Die angezeigten Informationen (Status, Beschreibung, Bilder, Kontaktdaten) stammen automatisiert aus einer
          externen Datenquelle und werden regelmäßig synchronisiert. Ein bereits vermitteltes oder nicht mehr
          verfügbares Tier kann trotzdem kurzzeitig noch angezeigt werden, bis der nächste Sync-Lauf den Stand
          aktualisiert. Für Richtigkeit, Vollständigkeit und Aktualität der Tierdaten wird keine Gewähr übernommen.
        </p>
      </section>

      <section>
        <h2>Konto</h2>
        <p>
          Für die Nutzung der Swipe-Ansicht und Merkliste ist eine Registrierung mit E-Mail-Adresse erforderlich. Du
          kannst dein Konto jederzeit selbst und endgültig im Kontobereich löschen.
        </p>
      </section>

      <section>
        <h2>Verfügbarkeit</h2>
        <p>
          Da die App auf eine externe Datenquelle angewiesen ist, kann es bei deren Nichterreichbarkeit zu
          veralteten Anzeigen kommen; die App bleibt in diesem Fall mit dem zuletzt bekannten Datenstand nutzbar. Ein
          Anspruch auf ständige Verfügbarkeit besteht nicht.
        </p>
      </section>

      <section>
        <h2>Änderungen</h2>
        <p>
          Diese Nutzungsbedingungen können bei Weiterentwicklung der App angepasst werden. Es gilt jeweils die zum
          Zeitpunkt der Nutzung aktuelle Fassung.
        </p>
      </section>
    </LegalPage>
  )
}
