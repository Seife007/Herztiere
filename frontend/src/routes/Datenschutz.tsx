import { LegalPage } from '../components/LegalPage'

export function Datenschutz() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">
        <strong>Hinweis:</strong> Diese Erklärung beschreibt die tatsächliche technische Datenverarbeitung dieser
        App, ersetzt aber keine Rechtsberatung. Der/die Verantwortliche (siehe{' '}
        <a href="/impressum" className="underline">
          Impressum
        </a>
        ) sollte den Text vor dem produktiven Betrieb fachkundig prüfen lassen.
      </p>

      <section>
        <h2>Verantwortliche Stelle</h2>
        <p>
          Verantwortlich im Sinne der DSGVO ist die im{' '}
          <a href="/impressum" className="text-coral-600 underline">
            Impressum
          </a>{' '}
          genannte Person/Organisation.
        </p>
      </section>

      <section>
        <h2>Welche Daten wir verarbeiten</h2>
        <ul>
          <li>
            <strong>Bei der Registrierung:</strong> E-Mail-Adresse, Passwort (nur als bcrypt-Hash gespeichert, nie im
            Klartext), optionale Präferenzen (Interesse an Tierarten, Erfahrungslevel, Wohnsituation).
          </li>
          <li>
            <strong>Bei der Nutzung:</strong> Deine Merkliste (welche Tiere du "gemerkt" hast, inkl. Zeitpunkt).
          </li>
          <li>
            <strong>Anmeldung:</strong> Ein technisch notwendiges, httpOnly-Cookie mit einem Sitzungs-Token (JWT) –
            kein Tracking, kein Zugriff durch JavaScript im Browser.
          </li>
          <li>
            <strong>Sicherheit:</strong> Bei sicherheitsrelevanten Admin-Aktionen (z. B. Sperren, Löschen) wird ein
            Protokolleintrag (Audit-Log) angelegt. IP-Adressen werden zur Missbrauchsabwehr kurzfristig für das
            Rate-Limiting von Login/Registrierung verwendet, nicht dauerhaft gespeichert.
          </li>
        </ul>
        <p className="mt-2">
          Die angezeigten Tierdaten selbst (Name, Fundort, Fotos etc.) sind keine personenbezogenen Daten von dir,
          sondern öffentliche Daten der Stadt Wien (siehe Nutzungsbedingungen).
        </p>
      </section>

      <section>
        <h2>Zweck und Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt zur Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO): Anmeldung,
          Anzeige des Swipe-Stapels passend zu deinen Präferenzen, Führen der Merkliste. Sicherheitsmaßnahmen
          (Rate-Limiting, Audit-Log) stützen sich auf berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1
          lit. f DSGVO).
        </p>
      </section>

      <section>
        <h2>Speicherdauer</h2>
        <p>
          Konto- und Merklisten-Daten werden gespeichert, solange dein Konto besteht. Löschst du dein Konto (im
          Kontobereich), werden E-Mail, Passwort-Hash, Präferenzen und Merkliste unwiderruflich und sofort gelöscht.
          Bereits bestehende Audit-Log-Einträge über sicherheitsrelevante Aktionen bleiben aus Nachvollziehbarkeits-
          gründen bestehen, werden dabei aber von deinem Konto getrennt (kein Personenbezug mehr).
        </p>
      </section>

      <section>
        <h2>Weitergabe an Dritte</h2>
        <p>
          Es findet aktuell keine Weitergabe deiner Daten an Dritte statt. Es werden keine Analyse- oder
          Tracking-Dienste eingesetzt. [Platzhalter: falls die App produktiv bei einem externen Hosting-/
          E-Mail-Anbieter betrieben wird, ist dieser Abschnitt um die jeweiligen Auftragsverarbeiter zu ergänzen.]
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Diese App setzt ausschließlich ein einzelnes, technisch notwendiges Cookie zur Anmeldung (httpOnly,
          sitzungsbezogen). Es werden keine Analyse-, Marketing- oder sonstigen technisch nicht notwendigen Cookies
          verwendet. Ein Cookie-Consent-Banner ist daher nach unserer Einschätzung nicht erforderlich (§ 165 Abs. 3
          TKG bzw. Art. 5 Abs. 3 ePrivacy-RL erlauben technisch notwendige Cookies ohne Einwilligung) – diese
          Einschätzung sollte bei Änderungen an der Cookie-Nutzung (z. B. Einbindung von Analytics) erneut geprüft
          werden.
        </p>
      </section>

      <section>
        <h2>Deine Rechte</h2>
        <p>Du hast jederzeit das Recht auf:</p>
        <ul>
          <li>
            <strong>Auskunft</strong> über die zu dir gespeicherten Daten sowie <strong>Datenübertragbarkeit</strong>{' '}
            – lade dir dazu im Kontobereich einen Datenexport als JSON herunter.
          </li>
          <li>
            <strong>Löschung</strong> deines Kontos – jederzeit selbst im Kontobereich möglich, sofortige und
            endgültige Löschung.
          </li>
          <li>
            <strong>Berichtigung</strong> deiner Präferenzen – direkt im Kontobereich änderbar.
          </li>
          <li>
            <strong>Einschränkung der Verarbeitung</strong> und <strong>Widerspruch</strong> – bitte über die im{' '}
            <a href="/impressum" className="text-coral-600 underline">
              Impressum
            </a>{' '}
            genannte Kontaktadresse.
          </li>
          <li>
            <strong>Beschwerde</strong> bei der österreichischen Datenschutzbehörde (dsb.gv.at), wenn du der Meinung
            bist, dass die Verarbeitung deiner Daten gegen die DSGVO verstößt.
          </li>
        </ul>
      </section>

      <section>
        <h2>Datensicherheit</h2>
        <p>
          Passwörter werden ausschließlich als bcrypt-Hash gespeichert. Tokens für "Passwort vergessen" sind
          zeitlich befristet, einmal verwendbar und werden ebenfalls nur gehasht gespeichert. Der Anmelde-Status
          läuft über ein httpOnly-Cookie, das nicht per JavaScript auslesbar ist.
        </p>
      </section>
    </LegalPage>
  )
}
