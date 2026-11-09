import TeamContact from "@/components/counter/TeamContact";
import { heading } from "@/components/counter/styles";

export default function Home() {
  return (
    <div className="pt-16">
      <p className="mb-2 font-display text-base font-semibold tracking-tight">Counter</p>
      <h1 className={heading}>Got a rent increase in Philadelphia?</h1>
      <p className="mt-4 text-lg leading-relaxed">
        Our team looks up nearby listings by hand. You see them, choose what to ask for, and get a message you can edit
        and send yourself.
      </p>
      <p className="mt-4 text-lg leading-relaxed">
        If our team sent you a link, open it to get started. Questions? Message us at <TeamContact />.
      </p>
    </div>
  );
}
