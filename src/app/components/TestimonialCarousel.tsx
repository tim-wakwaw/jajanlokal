'use client'

import { useState, useEffect } from 'react'
import TestimonialCard from './TestimonialCard'

interface Comment {
  user: string
  text: string
}

interface UMKM {
  id: number
  name: string
  category: string
  rating: number
  comments: Comment[]
}

interface TestimonialData {
  user: string
  text: string
  umkmName: string
  umkmCategory: string
  rating: number
}

export default function TestimonialCarousel() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/data/umkmData.json')
        const umkmData: UMKM[] = await response.json()
        
        // Collect ALL comments from ALL UMKM
        const allTestimonials: TestimonialData[] = []
        
        umkmData.forEach(umkm => {
          umkm.comments.forEach(comment => {
            allTestimonials.push({
              user: comment.user,
              text: comment.text,
              umkmName: umkm.name,
              umkmCategory: umkm.category,
              rating: umkm.rating
            })
          })
        })

        // Shuffle and duplicate for infinite scroll
        const shuffled = allTestimonials.sort(() => Math.random() - 0.5)
        // Create duplicates for seamless infinite scroll
        const duplicatedTestimonials = [...shuffled, ...shuffled]
        
        setTestimonials(duplicatedTestimonials)
        setLoading(false)
      } catch (error) {
        console.error('Error loading testimonials:', error)
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <div className="overflow-hidden">
        <div className="flex gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[380px] h-[280px] bg-gray-300 dark:bg-gray-700 rounded-xl shrink-0"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden w-full">
      {/* Custom CSS for smooth infinite scroll */}
      <style jsx>{`
        @keyframes scroll-left {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-right {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .scroll-left {
          animation: scroll-left 120s linear infinite;
        }
        
        .scroll-right {
          animation: scroll-right 100s linear infinite;
        }
        
        .testimonial-row {
          width: ${testimonials.length * 400}px;
        }
      `}</style>

      {/* Row 1 - Left to Right */}
      <div className="mb-8 overflow-hidden -mx-4">
        <div 
          className="flex gap-6 scroll-left testimonial-row pl-4"
        >
          {testimonials.map((testimonial, index) => (
            <div key={`row1-${index}`} className="shrink-0">
              <TestimonialCard
                user={testimonial.user}
                text={testimonial.text}
                umkmName={testimonial.umkmName}
                umkmCategory={testimonial.umkmCategory}
                rating={testimonial.rating}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 - Right to Left (reversed) */}
      <div className="overflow-hidden -mx-4">
        <div 
          className="flex gap-6 scroll-right testimonial-row pl-4"
        >
          {testimonials.slice().reverse().map((testimonial, index) => (
            <div key={`row2-${index}`} className="shrink-0">
              <TestimonialCard
                user={testimonial.user}
                text={testimonial.text}
                umkmName={testimonial.umkmName}
                umkmCategory={testimonial.umkmCategory}
                rating={testimonial.rating}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}