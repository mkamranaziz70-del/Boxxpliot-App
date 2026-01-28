import React, { useState } from "react";
import { View } from "react-native";
import Step1Customer from "./steps/Step1Customer";
import Step2Departure from "./steps/Step2Departure";
import Step3Arrival from "./steps/Step3Arrival";
import Step4Team from "./steps/Step4Team";
import Step5Pricing from "./steps/Step5Pricing";
import Step6Inventory from "./steps/Step6Inventory";
import Step7TermsReview from "./steps/Step7TermsReview";
import Step8ReviewSend from "./steps/Step8ReviewSend";

export default function CreateQuoteFlow({ navigation, route }: any) {
  const [step, setStep] = useState<number>(1);
  const [quoteId, setQuoteId] = useState<string | null>(
    route?.params?.id ?? null
  );
  const [draft, setDraft] = useState<any>({});

  const next = (data?: any, newQuoteId?: string) => {
    if (data) {
      setDraft((prev: any) => ({
        ...prev,
        ...data,
      }));
      console.log("🔁 MERGED DRAFT:", draft);
    }

    if (newQuoteId) {
      setQuoteId(newQuoteId);
    }

    setStep((s) => s + 1);
  };

  const back = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep((s) => s - 1);
    }
  };


  return (
    <View style={{ flex: 1 }}>
      {step === 1 && (
        <Step1Customer
          data={draft}
          quoteId={quoteId}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 2 && quoteId && (
        <Step2Departure
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 3 && quoteId && (
        <Step3Arrival
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 4 && quoteId && (
        <Step4Team
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 5 && quoteId && (
        <Step5Pricing
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 6 && quoteId && (
        <Step6Inventory
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onSkip={() => setStep(7)}
          onBack={back}
        />
      )}

      {step === 7 && quoteId && (
        <Step7TermsReview
          quoteId={quoteId}
          data={draft}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 8 && quoteId && (
        <Step8ReviewSend
          quote={{ id: quoteId, ...draft }}
          onSent={() => {
            navigation.replace("QuotationsList");
          }}
        />
      )}
    </View>
  );
}
