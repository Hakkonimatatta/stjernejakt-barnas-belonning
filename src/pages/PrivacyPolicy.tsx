import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Tilbake"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg font-bold">Tilbake</span>
        </div>
        <div>
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Om Stjernejobb
            </h2>
            <p className="text-gray-700">
              Stjernejobb er en belønningsapp designet for å hjelpe barn og foreldre 
              med hverdagsoppgaver på en morsom og motiverende måte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Datalagring
            </h2>
            <p className="text-gray-700">
              Appen lagrer all data <strong>lokalt på din enhet</strong>. Vi lagrer:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Barnets navn og oppgaver</li>
              <li>Belønninger og poengsum</li>
              <li>Innstillinger og preferanser</li>
            </ul>
            <p className="text-gray-700 mt-2">
              <strong>Ingen data sendes til servere.</strong> Alt forblir på din enhet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Sync Mellom Enheter
            </h2>
            <p className="text-gray-700">
              Hvis du bruker Sync-funksjonen, kan du dele data mellom enheter via 
              en sikker kode. Data blir ikke lagret permanent på servere - det er kun 
              en midlertidig overføring.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Personvern for Barn
            </h2>
            <p className="text-gray-700">
              Vi samler <strong>ikke inn personlig informasjon</strong> fra barn eller foreldre:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Ingen e-post eller telefonnummer blir samlet inn</li>
              <li>Ingen sporring eller analyse</li>
              <li>Ingen tredjepartsadvertering</li>
              <li>Ingen data-deling med eksterne part</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Sikkerhet
            </h2>
            <p className="text-gray-700">
              Siden all data lagres lokalt, er sikkerhetsen basert på enhetens innebygde sikkerhet. 
              Vi anbefaler å bruke PIN/biometri på enheten din for å beskytte dataen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Sletting av Data
            </h2>
            <p className="text-gray-700">
              Du kan når som helst slette all data fra appen ved å:
            </p>
            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
              <li>Slette appdata i innstillinger</li>
              <li>Avinstallere appen</li>
              <li>Tøme nettleserens lokale lagring (på web)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-3">
              Kontakt
            </h2>
            <p className="text-gray-700">
              Har du spørsmål om personvern? Kontakt oss via GitHub eller den e-postadressen 
              som er oppgitt på App Store/Google Play.
            </p>
          </section>

          <section className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Sist oppdatert:</strong> Januar 2026
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
