// The canvas only renders when something changes (frameloop="demand").
// Anything that animates asks for the next frame while it is still moving.

/** After an idle pause the first delta can be seconds long; never let an animation jump. */
export const step = (dt) => Math.min(dt, 1 / 30)

/** Run an easing that returns "still moving" and keep frames coming until it settles. */
export const keepGoing = (state, moving) => {
  if (moving) state.invalidate()
}
