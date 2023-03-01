import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

function CanvasScreen(props: any, ref: ((instance: unknown) => void) | React.RefObject<unknown> | null | undefined) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [context, setContext] = useState<CanvasRenderingContext2D>()
    const render = (imageData: Uint8ClampedArray) => {
        const imgData = context?.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        imgData?.data.set(imageData)
        if (imgData)
            context?.putImageData(imgData, 0, 0)
    }
    useEffect(() => {
        const context = canvasRef.current?.getContext('2d')
        if (context) setContext(context)
    }, [])
    useImperativeHandle(ref, () => ({
        render,
    }))
    return (
        <canvas
            style={{width: '100%', height: '100%'}}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            ref={canvasRef}
        />
    )
}

export default forwardRef(CanvasScreen)
