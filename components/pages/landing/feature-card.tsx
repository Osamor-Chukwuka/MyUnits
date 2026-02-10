'use client'

import { Button } from "@/components/ui/button"
import { LucideIcon, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface FeatureCardProps {
    body: {
        title: string;
        description: string;
        imageSrc: string;
        featureList: string[];
        cta: string
        order: string | null;
        icon: LucideIcon;
    }
}

export const FeatureCard = ({ body }: FeatureCardProps) => {
    return (
        <div>
            <div className="py-20 border-border border-b">
                <div className="items-center gap-12 grid lg:grid-cols-2">
                    <div className={`${body.order} animate-delay-200 animate-fade-in-up`}>
                        <h2 className="mb-6 font-bold text-foreground text-4xl">{body.title}</h2>
                        <p className="mb-8 text-muted-foreground text-lg leading-relaxed">
                            {body.description}
                        </p>
                        <ul className="space-y-4 mb-8">
                            {body.featureList.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <div className="flex justify-center items-center bg-primary/20 rounded-full w-6 h-6">
                                        <Zap className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-foreground">{feature}</span>
                                </li>
                            ))}

                        </ul>
                        <Link href="/signup">
                            <Button size="lg" className="gap-2">
                                {body.cta}
                                <body.icon className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex justify-center animate-delay-300 animate-fade-in-up">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl rounded-2xl" />
                            <Image
                                src={body.imageSrc}
                                alt={body.title}
                                width={400}
                                height={400}
                                className="relative shadow-xl rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}