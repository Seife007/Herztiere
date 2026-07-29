import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { AnimalCard } from './AnimalCard'
import type { Animal } from '../lib/types'

const SWIPE_THRESHOLD = 120

function SwipeCard({
  animal,
  isTop,
  stackIndex,
  exitDirection,
  onSwiped,
}: {
  animal: Animal
  isTop: boolean
  stackIndex: number
  exitDirection: 'left' | 'right'
  onSwiped: (direction: 'left' | 'right') => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-18, 18])
  const likeOpacity = useTransform(x, [20, 140], [0, 1])
  const skipOpacity = useTransform(x, [-140, -20], [1, 0])

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwiped('right')
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwiped('left')
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 10 - stackIndex, x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      initial={{ scale: 0.92, opacity: 0, y: 0 }}
      animate={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 12, opacity: 1 }}
      exit={{ x: exitDirection === 'right' ? 400 : -400, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      whileDrag={{ scale: 1.02 }}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <AnimalCard animal={animal} />
      {isTop && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-6 top-6 rounded-2xl border-4 border-heart-500 px-4 py-1 text-2xl font-bold text-heart-500"
          >
            MERKEN
          </motion.div>
          <motion.div
            style={{ opacity: skipOpacity }}
            className="pointer-events-none absolute right-6 top-6 rounded-2xl border-4 border-stone-400 px-4 py-1 text-2xl font-bold text-stone-400"
          >
            WEITER
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export function SwipeDeck({
  animals,
  onLike,
  onSkip,
  onEmpty,
}: {
  animals: Animal[]
  onLike: (animal: Animal) => void
  onSkip: (animal: Animal) => void
  onEmpty: () => void
}) {
  const [queue, setQueue] = useState(animals)
  const [heartBurst, setHeartBurst] = useState(false)
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('right')

  function swipeTop(direction: 'left' | 'right') {
    const top = queue[0]
    if (!top) return
    setExitDirection(direction)
    if (direction === 'right') {
      onLike(top)
      setHeartBurst(true)
      setTimeout(() => setHeartBurst(false), 500)
    } else {
      onSkip(top)
    }
    setQueue((prev) => {
      const next = prev.slice(1)
      if (next.length === 0) onEmpty()
      return next
    })
  }

  const visible = queue.slice(0, 3)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[28rem] w-80 overflow-hidden sm:h-[32rem] sm:w-96">
        <AnimatePresence>
          {visible.map((animal, index) => (
            <SwipeCard
              key={animal.id}
              animal={animal}
              isTop={index === 0}
              stackIndex={index}
              exitDirection={exitDirection}
              onSwiped={swipeTop}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {heartBurst && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              exit={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-8xl"
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {queue.length > 0 && (
        <div className="flex gap-6">
          <button
            aria-label="Überspringen"
            onClick={() => swipeTop('left')}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-stone-400 shadow-md transition-transform hover:scale-105"
          >
            ✕
          </button>
          <button
            aria-label="Merken"
            onClick={() => swipeTop('right')}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-heart-500 text-2xl text-white shadow-md transition-transform hover:scale-105"
          >
            ❤
          </button>
        </div>
      )}
    </div>
  )
}
