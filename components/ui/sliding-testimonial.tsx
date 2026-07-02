import Image from "next/image"

const testimonials = [
  {
    name: "yashwanth M",
    profession: "Software Developer",
    description:
      "Zepa UI saved us days on our landing page. Copied a hero and navbar, tweaked the motion, and shipped the same afternoon.",
    avatar: "/yash.png",
    image: "/l1.png",
  },
  {
    name: "Han Lee",
    profession: "SWE Intern",
    description:
      "The components feel premium out of the box. Motion is already dialed in — I just drop them in and focus on product.",
    avatar: "/han.jpeg",
    image: "/l4.png",
  },
  {
    name: "Ananad Vardhan",
    profession: ".net Developer",
    description:
      "Copy-paste workflow is exactly what I wanted. Heroes, sections, UI blocks — all ready for Next.js without fighting setup.",
    avatar: "/anaad.png",
    image: "/l6.png",
  },
  {
    name: "Bhavana V",
    profession: "Frontend developer",
    description:
      "Finally a component library that cares about animation. Our marketing site went from wireframe to polished in a weekend.",
    avatar:
      "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "/l5.png",
  },
  {
    name: "Sam Evans",
    profession: "Analyst",
    description:
      "I use Zepa UI for every new side project. Pick a hero, paste the code, and it actually looks like a real product.",
    avatar: "/samevans.jpeg",
    image: "/l3.png",
  },
  {
    name: "vivek kommareddy",
    profession: "Software Engineer",
    description:
      "Clean React components with thoughtful motion. Easy to customize and impossible to tell they started as copy-paste.",
    avatar: "/vivek.png",
    image: "/core.png",
  },
  {
    name: "Avinash T",
    profession: "Software Developer",
    description:
      "Clean React components with thoughtful motion. Easy to customize and impossible to tell they started as copy-paste.",
    avatar: "/avi.jpeg",
    image: "/compass.png",
  },
  {
    name: "Manohar L",
    profession: "Full Stack Developer",
    description:
      "Zepa completely changed how I approach landing pages. The motion design is already baked in — I spend zero time on animations and ship polished UIs in hours.",
    avatar: "/M.jpeg",
    image: "/f.png",
  },
]

const duplicatedTestimonials = [...testimonials, ...testimonials]

export default function FUITestimonialWithSlide() {
  return (
    <section className="w-full overflow-hidden bg-landing pt-6 pb-16 md:pt-8 md:pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            What builders say
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Teams and indie devs using Zepa UI to ship interfaces faster.
          </p>
        </div>

        <div
          className="relative flex max-w-full shrink-0 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to left, transparent 0%, black 12%, black 88%, transparent 100%)",
          }}
        >
          <div className="animate-x-slider flex w-max gap-5">
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex h-full w-[min(600px,85vw)] shrink-0 grow-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60"
              >
                <p className="px-5 py-5 text-pretty text-lg font-light tracking-tight text-zinc-200 sm:text-xl md:text-2xl">
                  &ldquo;{testimonial.description}&rdquo;
                </p>
                <div className="flex w-full gap-1 overflow-hidden border-t border-zinc-800">
                  <div className="flex w-3/4 items-center gap-3 px-4 py-3">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="flex flex-1 flex-col items-start justify-start gap-0">
                      <h5 className="text-base font-medium text-white md:text-lg">
                        {testimonial.name}
                      </h5>
                      <p className="-mt-1 text-sm text-zinc-500 md:text-base">
                        {testimonial.profession}
                      </p>
                    </div>
                  </div>
                  <div className="w-px bg-zinc-800" />
                  <div className="max-w-full self-center pl-2">
                    <Image
                      src={testimonial.image}
                      alt="Company logo"
                      width={112}
                      height={40}
                      className="h-10 w-28 flex-none px-2 brightness-0 invert"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
