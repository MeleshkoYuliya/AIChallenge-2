import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, QrCode, Users } from "lucide-react";
import hero from "@/assets/hero.jpg";

const Index = () => {
  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-card shadow-elegant">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="px-6 py-20 text-center md:px-16 md:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Free for community events
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Host gatherings <br />
            <span className="text-gradient">people remember.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Publish an event page in minutes. Capacity, waitlists, QR tickets,
            and check-in — all in one elegant tool.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-glow hover:opacity-90">
              <Link to="/host">Start hosting <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/explore">Explore events</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { icon: Calendar, title: "Beautiful event pages", desc: "Cover image, schedule, venue or online link, capacity. Publishable in minutes." },
          { icon: Users, title: "Capacity & waitlist", desc: "Automatic FIFO waitlist promotes the next attendee when seats open." },
          { icon: QrCode, title: "QR tickets & check-in", desc: "Each attendee gets a unique QR pass. Checkers verify at the door." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass glow-border rounded-2xl p-6">
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Index;
