import { Utensils, CreditCard, Bike } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Utensils size={40} className="text-primary" />,
      title: "Elige tu Antojo",
      description: "Explora los menús de las cocinas más queridas de la ciudad."
    },
    {
      icon: <CreditCard size={40} className="text-primary" />,
      title: "Pago Seguro",
      description: "Paga de forma segura con tarjeta, transferencia o efectivo al recibir."
    },
    {
      icon: <Bike size={40} className="text-primary" />,
      title: "Entrega Veloz",
      description: "Nuestros repartidores conocen cada atajo en Valledupar para que llegue caliente."
    }
  ];

  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-screen-2xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-black font-headline mb-16">Tan Simple como un Vallenato</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-headline">{step.title}</h3>
              <p className="text-on-surface-variant max-w-xs font-body">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
