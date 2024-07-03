"use server";

import Canvas from "@/app/studio/canvas";
import { loadCanvasServer } from "@/backend-lib/actions";
import { notFound } from "next/navigation";
import React from "react";
import Modal from "./modal";

export default async function ViewModal({ params }: { params: { id: string } }) {
    const canvasId = params.id;
    const { isCanvasLoaded, canvasData, errorMessage } = await loadCanvasServer(canvasId);
    if (!isCanvasLoaded || !canvasData) {
        console.log(errorMessage);
        notFound();
    }

    return (
        <Modal>
            <Canvas canvasData={canvasData} />
        </Modal>
    )
}