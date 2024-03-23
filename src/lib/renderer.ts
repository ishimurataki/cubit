import { vec3, vec4, mat4 } from "@/lib/gl-matrix/index";
import { Mode } from "@/lib/polar-camera";
import Scene from "@/lib/renderables/scene";
import CanvasState, { TracerMaterial } from "@/app/create/canvas-state";

enum ShaderMode {
    Plain,
    Tracer
}

export default class Renderer {
    private gl: WebGLRenderingContext;

    private plainShaderProgram: WebGLShader;
    private tracerShaderProgram: WebGLShader;
    private renderShaderProgram: WebGLShader;

    private plainProgramInfo: ({
        attribLocations: {
            vertexPosition: number;
            vertexColor: number;
            vertexNormal: number;
            vertexMaterial: number;
        },
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation | null;
            modelViewMatrix: WebGLUniformLocation | null;
            modelMatrix: WebGLUniformLocation | null;
            color: WebGLUniformLocation | null;
            useUniformColor: WebGLUniformLocation | null;
            cameraPosition: WebGLUniformLocation | null;
            sunPosition: WebGLUniformLocation | null;
            sunColor: WebGLUniformLocation | null;
            sunStrength: WebGLUniformLocation | null;
            ambienceStrength: WebGLUniformLocation | null;
        }
    });
    private tracerProgramInfo: ({
        attribLocations: {
            vertexPosition: number;
        },
        uniformLocations: {
            ray00: WebGLUniformLocation | null;
            ray01: WebGLUniformLocation | null;
            ray10: WebGLUniformLocation | null;
            ray11: WebGLUniformLocation | null;
            eye: WebGLUniformLocation | null;
            renderTexture: WebGLUniformLocation | null;
            cubeColorSpaceTexture: WebGLUniformLocation | null;
            cubeMaterialSpaceTexture: WebGLUniformLocation | null;
            timeSinceStart: WebGLUniformLocation | null;
            textureWeight: WebGLUniformLocation | null;
            sunPosition: WebGLUniformLocation | null;
            width: WebGLUniformLocation | null;
            height: WebGLUniformLocation | null;
            backgroundColor: WebGLUniformLocation | null;
            tracerMaterial: WebGLUniformLocation | null;
            diffuseStrength: WebGLUniformLocation | null;
            ambienceStrength: WebGLUniformLocation | null;
        }
    });
    private renderProgramInfo: ({
        attribLocations: {
            vertexPosition: number;
        },
        uniformLocations: {
            renderTexture: WebGLUniformLocation | null;
        }
    });

    private activeShader: ShaderMode = ShaderMode.Plain;

    private tracerVertexBuffer: WebGLBuffer | null;
    private tracerFrameBuffer: WebGLFramebuffer | null;
    private tracerTextures: (WebGLTexture | null)[];
    private screen00: vec4 = vec4.fromValues(-1, -1, 0, 1);
    private screen01: vec4 = vec4.fromValues(-1, +1, 0, 1);
    private screen10: vec4 = vec4.fromValues(+1, -1, 0, 1);
    private screen11: vec4 = vec4.fromValues(+1, +1, 0, 1);

    private previousCanvasWidth: number;
    private previousCanvasHeight: number;

    constructor(gl: WebGLRenderingContext,
        tracerShaderProgram: WebGLShader, renderShaderProgram: WebGLShader, plainShaderProgram: WebGLShader) {
        this.gl = gl;
        this.tracerShaderProgram = tracerShaderProgram;
        this.renderShaderProgram = renderShaderProgram;
        this.plainShaderProgram = plainShaderProgram;
        this.plainProgramInfo = {
            attribLocations: {
                vertexPosition: gl.getAttribLocation(plainShaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(plainShaderProgram, 'aVertexColor'),
                vertexNormal: gl.getAttribLocation(plainShaderProgram, 'aVertexNormal'),
                vertexMaterial: gl.getAttribLocation(plainShaderProgram, 'aVertexMaterial')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(plainShaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(plainShaderProgram, 'uModelViewMatrix'),
                modelMatrix: gl.getUniformLocation(plainShaderProgram, 'uModelMatrix'),
                color: gl.getUniformLocation(plainShaderProgram, 'uColor'),
                useUniformColor: gl.getUniformLocation(plainShaderProgram, 'uUseUniformColor'),
                cameraPosition: gl.getUniformLocation(plainShaderProgram, 'uCameraPosition'),
                sunPosition: gl.getUniformLocation(plainShaderProgram, 'uSunPosition'),
                sunColor: gl.getUniformLocation(plainShaderProgram, 'uSunColor'),
                sunStrength: gl.getUniformLocation(plainShaderProgram, "uSunStrength"),
                ambienceStrength: gl.getUniformLocation(plainShaderProgram, "uAmbienceStrength")
            }
        };
        this.tracerProgramInfo = {
            attribLocations: {
                vertexPosition: gl.getAttribLocation(tracerShaderProgram, "aVertexPosition")
            },
            uniformLocations: {
                ray00: gl.getUniformLocation(tracerShaderProgram, "uRay00"),
                ray01: gl.getUniformLocation(tracerShaderProgram, "uRay01"),
                ray10: gl.getUniformLocation(tracerShaderProgram, "uRay10"),
                ray11: gl.getUniformLocation(tracerShaderProgram, "uRay11"),
                eye: gl.getUniformLocation(tracerShaderProgram, "uEye"),
                renderTexture: gl.getUniformLocation(tracerShaderProgram, "uRenderTexture"),
                cubeColorSpaceTexture: gl.getUniformLocation(tracerShaderProgram, "uCubeColorSpaceTexture"),
                cubeMaterialSpaceTexture: gl.getUniformLocation(tracerShaderProgram, "uCubeMaterialSpaceTexture"),
                timeSinceStart: gl.getUniformLocation(tracerShaderProgram, "uTimeSinceStart"),
                textureWeight: gl.getUniformLocation(tracerShaderProgram, "uTextureWeight"),
                sunPosition: gl.getUniformLocation(tracerShaderProgram, "uLightPos"),
                width: gl.getUniformLocation(tracerShaderProgram, "uWidth"),
                height: gl.getUniformLocation(tracerShaderProgram, "uHeight"),
                backgroundColor: gl.getUniformLocation(tracerShaderProgram, "uBackgroundColor"),
                tracerMaterial: gl.getUniformLocation(tracerShaderProgram, "uTracerMaterial"),
                diffuseStrength: gl.getUniformLocation(tracerShaderProgram, "uDiffuseStrength"),
                ambienceStrength: gl.getUniformLocation(tracerShaderProgram, "uAmbienceStrength")
            }
        };
        this.renderProgramInfo = {
            attribLocations: {
                vertexPosition: gl.getAttribLocation(renderShaderProgram, "aVertexPosition")
            },
            uniformLocations: {
                renderTexture: gl.getUniformLocation(renderShaderProgram, "uRenderTexture")
            }
        };
        let vertices: number[] = [
            -1, -1,
            -1, +1,
            +1, -1,
            +1, +1
        ];

        this.tracerVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tracerVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.tracerFrameBuffer = gl.createFramebuffer();
        this.tracerTextures = [];
        for (let i = 0; i < 2; i++) {
            this.tracerTextures.push(gl.createTexture());
            gl.bindTexture(gl.TEXTURE_2D, this.tracerTextures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, CanvasState.canvas.clientWidth, CanvasState.canvas.clientHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        this.previousCanvasWidth = CanvasState.canvas.clientWidth;
        this.previousCanvasHeight = CanvasState.canvas.clientHeight;

        this.gl.viewport(0, 0, CanvasState.canvas.clientWidth, CanvasState.canvas.clientHeight);
    }

    resizeTracerTextures() {
        this.tracerFrameBuffer = this.gl.createFramebuffer();
        this.tracerTextures = [];
        for (let i = 0; i < 2; i++) {
            this.tracerTextures.push(this.gl.createTexture());
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.tracerTextures[i]);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, CanvasState.canvas.clientWidth, CanvasState.canvas.clientHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        }
        CanvasState.sampleCount = 0;
    }

    tick(currentTime: number) {
        let deltaTime = currentTime - CanvasState.previousTime;
        if (CanvasState.transitioning) {
            let a = CanvasState.transitionTime / 1000;
            if (a > 1) {
                CanvasState.transitioning = false;
                CanvasState.transitionTime = 0;
            }
            CanvasState.camera.transition(a);
            CanvasState.transitionTime += deltaTime;
            CanvasState.sampleCount = 0;
        }
    }

    render(currentTime: number) {
        this.gl.enable(this.gl.DEPTH_TEST);

        CanvasState.canvas.width = CanvasState.canvas.clientWidth;
        CanvasState.canvas.height = CanvasState.canvas.clientHeight;

        if (CanvasState.canvas.clientWidth != this.previousCanvasWidth ||
            CanvasState.canvas.clientHeight != this.previousCanvasHeight) {
            CanvasState.camera.changeWidthHeight(CanvasState.canvas.clientWidth, CanvasState.canvas.clientHeight);
            this.gl.viewport(0, 0, CanvasState.canvas.clientWidth, CanvasState.canvas.clientHeight);

            this.previousCanvasWidth = CanvasState.canvas.clientWidth;
            this.previousCanvasHeight = CanvasState.canvas.clientHeight;

            this.resizeTracerTextures();
        }

        this.gl.clearColor(Scene.backgroundColor[0],
            Scene.backgroundColor[1],
            Scene.backgroundColor[2], 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        let projectionMatrix = CanvasState.camera.getProjMatrix();
        let modelViewMatrix = CanvasState.camera.getViewMatrix();
        let viewProjectionMatrix = mat4.multiply(mat4.create(), projectionMatrix, modelViewMatrix);
        mat4.invert(CanvasState.viewProjectionInverse, viewProjectionMatrix);

        if (CanvasState.camera.getMode() == Mode.Editor) {
            if (this.activeShader != ShaderMode.Plain) {
                this.gl.useProgram(this.plainShaderProgram);
                this.activeShader = ShaderMode.Plain;
            }
            this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
            this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
            this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.cameraPosition, CanvasState.camera.getPosition());
            this.gl.uniform1i(this.plainProgramInfo.uniformLocations.useUniformColor, 1);
            // Draw tiles
            for (let tile of CanvasState.scene.editorTiles) {
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tile.mesh.positionBuffer);
                this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
                this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
                this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, tile.color);
                this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, tile.modelMatrix);
                this.gl.drawArrays(tile.mesh.drawingMode, 0, tile.mesh.vertices.length / 3);
            }
            // Draw cubes
            let firstCube = true
            for (let cube of CanvasState.scene.cubeLayer.values()) {
                if (firstCube) {
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cube.mesh.positionBuffer);
                    this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
                    this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
                    firstCube = false;
                }
                this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, cube.color);
                this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, cube.modelMatrix);
                this.gl.drawArrays(cube.mesh.drawingMode, 0, cube.mesh.vertices.length / 3);
            }

            // Draw hover cube
            if (CanvasState.renderHoverCube) {
                if (firstCube) {
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.hoverCube.mesh.positionBuffer);
                    this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
                    this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
                }
                this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, Scene.hoverCubeColor);
                this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, CanvasState.scene.hoverCube.modelMatrix);
                this.gl.drawArrays(CanvasState.scene.hoverCube.mesh.drawingMode, 0, CanvasState.scene.hoverCube.mesh.vertices.length / 3);
            }

            // Draw mirror cube markers
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.mirrorMarkerMesh.positionBuffer);
            this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
            for (let cube of CanvasState.scene.cubeLayer.values()) {
                if (cube.material == TracerMaterial.Mirror) {
                    let lerpWith = (cube.color[0] + cube.color[1] + cube.color[2]) / 3.0 > 0.5 ?
                        vec3.fromValues(0.0, 0.0, 0.0) :
                        vec3.fromValues(1.0, 1.0, 1.0);
                    let markerColor = vec3.lerp(vec3.create(), cube.color, lerpWith, 0.2);
                    this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, markerColor);
                    this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, cube.modelMatrix);
                    this.gl.drawArrays(CanvasState.scene.mirrorMarkerMesh.drawingMode, 0,
                        CanvasState.scene.mirrorMarkerMesh.vertices.length / 3);
                }
            }

            // Draw grid
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.grid.mesh.positionBuffer);
            this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
            this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, CanvasState.scene.grid.color);
            this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, CanvasState.scene.grid.modelMatrix);
            this.gl.drawArrays(CanvasState.scene.grid.mesh.drawingMode, 0, CanvasState.scene.grid.mesh.vertices.length / 3);
        }
        else if (CanvasState.camera.getMode() == Mode.Viewer) {
            if (CanvasState.rayTrace) {
                if (this.activeShader != ShaderMode.Tracer) {
                    this.gl.useProgram(this.tracerShaderProgram);
                    this.activeShader = ShaderMode.Tracer;
                }
                this.renderViewerRayTraced(viewProjectionMatrix, currentTime);
            } else {
                if (this.activeShader != ShaderMode.Plain) {
                    this.gl.useProgram(this.plainShaderProgram);
                    this.activeShader = ShaderMode.Plain;
                }
                this.renderViewerPlain(projectionMatrix, modelViewMatrix);
            }
        }
    }

    renderViewerPlain(projectionMatrix: mat4, modelViewMatrix: mat4) {
        this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.cameraPosition, CanvasState.camera.getPosition());
        this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.sunColor, CanvasState.scene.sun.color);
        this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.sunPosition, CanvasState.scene.sunCenter);
        this.gl.uniform1f(this.plainProgramInfo.uniformLocations.sunStrength, CanvasState.sunStrength);
        this.gl.uniform1f(this.plainProgramInfo.uniformLocations.ambienceStrength, CanvasState.ambienceStrength);
        this.gl.uniform1i(this.plainProgramInfo.uniformLocations.useUniformColor, 0);

        // Draw cube space
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.cubeSpace.cubeSpacePositionBuffer);
        this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.cubeSpace.cubeSpaceNormalBuffer);
        this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexNormal, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexNormal);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.cubeSpace.cubeSpaceColorBuffer);
        this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexColor, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexColor);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.cubeSpace.cubeSpaceMaterialBuffer);
        this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexMaterial, 1, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexMaterial);
        this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, mat4.create());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, CanvasState.scene.cubeSpace.cubeSpaceNumberOfVertices);
        this.gl.disableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexNormal);
        this.gl.disableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexColor);
        this.gl.disableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexMaterial);

        // Draw sun
        this.gl.uniform1i(this.plainProgramInfo.uniformLocations.useUniformColor, 1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.sun.mesh.positionBuffer);
        this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
        this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, CanvasState.scene.sun.color);
        this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, CanvasState.scene.sun.modelMatrix);
        this.gl.drawArrays(CanvasState.scene.sun.mesh.drawingMode, 0, CanvasState.scene.sun.mesh.vertices.length / 3);

        // Draw sun selection
        if (CanvasState.renderSunSelection) {
            this.gl.disable(this.gl.DEPTH_TEST);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, CanvasState.scene.sunSelection.mesh.positionBuffer);
            this.gl.vertexAttribPointer(this.plainProgramInfo.attribLocations.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.plainProgramInfo.attribLocations.vertexPosition);
            this.gl.uniform3fv(this.plainProgramInfo.uniformLocations.color, CanvasState.scene.sunSelection.color);
            this.gl.uniformMatrix4fv(this.plainProgramInfo.uniformLocations.modelMatrix, false, CanvasState.scene.sunSelection.modelMatrix);
            this.gl.drawArrays(CanvasState.scene.sunSelection.mesh.drawingMode, 0, CanvasState.scene.sunSelection.mesh.vertices.length / 3);
        }
    }

    renderViewerRayTraced(viewProjectionMatrix: mat4, currentTime: number) {
        this.gl.useProgram(this.tracerShaderProgram);

        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.width, CanvasState.canvas.clientWidth);
        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.height, CanvasState.canvas.clientHeight);

        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.backgroundColor, Scene.backgroundColor);
        this.gl.uniform1i(this.tracerProgramInfo.uniformLocations.tracerMaterial, CanvasState.tracerMaterial);

        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.diffuseStrength, CanvasState.sunStrength);
        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.ambienceStrength, CanvasState.ambienceStrength);

        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.eye, CanvasState.camera.eye);
        let jitter: vec3 = vec3.scale(vec3.create(),
            vec3.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1, 0),
            1 / (5000 + 5 * Math.max(CanvasState.sampleCount, 0.0)));
        let inverse: mat4 = mat4.invert(
            mat4.create(),
            mat4.translate(mat4.create(), viewProjectionMatrix, jitter)
        );

        let ray00_i1: vec4 = vec4.transformMat4(vec4.create(), this.screen00, inverse);
        let ray01_i1: vec4 = vec4.transformMat4(vec4.create(), this.screen01, inverse);
        let ray10_i1: vec4 = vec4.transformMat4(vec4.create(), this.screen10, inverse);
        let ray11_i1: vec4 = vec4.transformMat4(vec4.create(), this.screen11, inverse);

        let ray00_i2: vec4 = vec4.scale(vec4.create(), ray00_i1, 1 / ray00_i1[3]);
        let ray01_i2: vec4 = vec4.scale(vec4.create(), ray01_i1, 1 / ray01_i1[3]);
        let ray10_i2: vec4 = vec4.scale(vec4.create(), ray10_i1, 1 / ray10_i1[3]);
        let ray11_i2: vec4 = vec4.scale(vec4.create(), ray11_i1, 1 / ray11_i1[3]);

        let ray00: vec3 = vec3.subtract(vec3.create(), vec3.fromValues(ray00_i2[0], ray00_i2[1], ray00_i2[2]), CanvasState.camera.eye);
        let ray01: vec3 = vec3.subtract(vec3.create(), vec3.fromValues(ray01_i2[0], ray01_i2[1], ray01_i2[2]), CanvasState.camera.eye);
        let ray10: vec3 = vec3.subtract(vec3.create(), vec3.fromValues(ray10_i2[0], ray10_i2[1], ray10_i2[2]), CanvasState.camera.eye);
        let ray11: vec3 = vec3.subtract(vec3.create(), vec3.fromValues(ray11_i2[0], ray11_i2[1], ray11_i2[2]), CanvasState.camera.eye);

        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.ray00, ray00);
        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.ray01, ray01);
        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.ray10, ray10);
        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.ray11, ray11);

        this.gl.uniform3fv(this.tracerProgramInfo.uniformLocations.sunPosition, CanvasState.scene.sunCenter);
        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.timeSinceStart, currentTime);

        let textureWeight: number = Math.max(CanvasState.sampleCount - 3, 0) / (CanvasState.sampleCount + 1);
        this.gl.uniform1f(this.tracerProgramInfo.uniformLocations.textureWeight, textureWeight);

        this.gl.uniform1i(this.tracerProgramInfo.uniformLocations.cubeColorSpaceTexture, 1);
        this.gl.uniform1i(this.tracerProgramInfo.uniformLocations.cubeMaterialSpaceTexture, 2);
        this.gl.uniform1i(this.tracerProgramInfo.uniformLocations.renderTexture, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, CanvasState.scene.cubeSpace.cubeColorSpaceTexture);
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, CanvasState.scene.cubeSpace.cubeMaterialSpaceTexture);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tracerTextures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tracerVertexBuffer);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.tracerFrameBuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.tracerTextures[1], 0);
        this.gl.vertexAttribPointer(this.tracerProgramInfo.attribLocations.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.tracerProgramInfo.attribLocations.vertexPosition);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.tracerTextures.reverse();

        this.gl.useProgram(this.renderShaderProgram);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tracerTextures[0]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tracerVertexBuffer);
        this.gl.vertexAttribPointer(this.renderProgramInfo.attribLocations.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.renderProgramInfo.attribLocations.vertexPosition);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        CanvasState.sampleCount++;
    }
}