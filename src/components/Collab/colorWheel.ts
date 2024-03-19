const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180)

export function generateColorWheel(
  canvas: HTMLCanvasElement,
  size: number,
  brightness: number = 1,
) {
  if (size === void 0) {
    size = 400
  }
  const centerColor = 'white'
  const radius = size / 2
  const ctx = canvas.getContext('2d')
  canvas.width = canvas.height = size
  //Generate canvas clone to draw increments on
  const canvasClone = document.createElement('canvas')
  canvasClone.width = canvasClone.height = size
  const canvasCloneCtx = canvasClone.getContext('2d')!
  //Initiate variables
  let angle = 0
  const hexCode = [255, 0, 0]
  let pivotPointer = 0
  const colorOffsetByDegree = 4.322
  //For each degree in circle, perform operation
  while (angle++ < 360) {
    //find index immediately before and after our pivot
    const pivotPointerbefore = (pivotPointer + 3 - 1) % 3
    //Modify colors
    const pivotColor = hexCode[pivotPointer]!
    const pivotBeforeColor = hexCode[pivotPointerbefore]!
    if (pivotColor < 255) {
      //If main points isn't full, add to main pointer
      hexCode[pivotPointer] =
        pivotColor + colorOffsetByDegree > 255 ? 255 : pivotColor + colorOffsetByDegree
    } else if (pivotBeforeColor > 0) {
      //If color before main isn't zero, subtract
      hexCode[pivotPointerbefore] =
        pivotBeforeColor > colorOffsetByDegree ? pivotBeforeColor - colorOffsetByDegree : 0
    } else if (pivotColor >= 255) {
      //If main color is full, move pivot
      hexCode[pivotPointer] = 255
      pivotPointer = (pivotPointer + 1) % 3
    }
    //clear clone
    canvasCloneCtx.clearRect(0, 0, size, size)
    //Generate gradient and set as fillstyle
    const grad = canvasCloneCtx.createRadialGradient(radius, radius, 0, radius, radius, radius)
    grad.addColorStop(0, centerColor)
    const rgb = hexCode.map((h) => Math.floor(h) * brightness)
    grad.addColorStop(1, 'rgb(' + rgb.join(',') + ')')
    canvasCloneCtx.fillStyle = grad
    //draw full circle with new gradient
    canvasCloneCtx.globalCompositeOperation = 'source-over'
    canvasCloneCtx.beginPath()
    canvasCloneCtx.arc(radius, radius, radius, 0, Math.PI * 2)
    canvasCloneCtx.closePath()
    canvasCloneCtx.fill()
    //Switch to "Erase mode"
    canvasCloneCtx.globalCompositeOperation = 'destination-out'
    //Carve out the piece of the circle we need for this angle
    canvasCloneCtx.beginPath()
    canvasCloneCtx.arc(radius, radius, 0, degreesToRadians(angle + 1), degreesToRadians(angle + 1))
    canvasCloneCtx.arc(
      radius,
      radius,
      radius + 1,
      degreesToRadians(angle + 1),
      degreesToRadians(angle + 1),
    )
    canvasCloneCtx.arc(
      radius,
      radius,
      radius + 1,
      degreesToRadians(angle + 1),
      degreesToRadians(angle - 1),
    )
    canvasCloneCtx.arc(radius, radius, 0, degreesToRadians(angle + 1), degreesToRadians(angle - 1))
    canvasCloneCtx.closePath()
    canvasCloneCtx.fill()
    //Draw carved-put piece on main canvas
    ctx!.drawImage(canvasClone, 0, 0)
  }
}
