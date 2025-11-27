// src/lib/local-ai/webgpu.ts
type GPUContext = {
  device: GPUDevice;
  queue: GPUQueue;
};

async function initWebGPU(): Promise<GPUContext | null> {
  if (!('gpu' in navigator)) return null;
  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) return null;
    const device = await adapter.requestDevice();
    const queue = device.queue;
    return { device, queue };
  } catch (e) {
    console.warn('WebGPU init failed', e);
    return null;
  }
}

/**
 * Toy compute: produce a pseudo-random 16-element vector from the prompt using a compute shader.
 * This is NOT ML — it's a tiny, deterministic hash-like GPU routine to create a vector used for similarity.
 */
async function computeVectorGPU(device: GPUDevice, input: Uint8Array) {
  // create buffers
  const inBuf = device.createBuffer({
    size: input.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(inBuf, 0, input);

  const outBufSize = 4 * 16; // 16 floats
  const outBuf = device.createBuffer({
    size: outBufSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
  });

  // compute shader - simple accumulation & transform (WGSL)
  const shader = `
  [[block]] struct In { data: array<u32>; };
  [[block]] struct Out { data: array<f32>; };
  [[group(0), binding(0)]] var<storage, read> inbuf: In;
  [[group(0), binding(1)]] var<storage, read_write> outbuf: Out;
  [[stage(compute), workgroup_size(64)]]
  fn main([[builtin(global_invocation_id)]] gid: vec3<u32>) {
    let idx = gid.x;
    // simple deterministic mixing: sum bytes with varying weights
    var acc: f32 = 0.0;
    let N = arrayLength(&inbuf.data);
    for (var i: u32 = 0u; i < N; i = i + 1u) {
      let b = f32(inbuf.data[i]);
      acc = acc + b * f32((i + 1u) % 10u + 1u);
    }
    // produce 16 outputs using simple transforms
    if (idx < 16u) {
      outbuf.data[idx] = fract(sin(f32(idx) + acc) * 43758.5453123);
    }
  }
  `;
  // create pipeline
  const mod = device.createShaderModule({ code: shader });
  const pipeline = device.createComputePipeline({ compute: { module: mod, entryPoint: 'main' } });

  const bindGroupLayout = pipeline.getBindGroupLayout(0);
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: inBuf } },
      { binding: 1, resource: { buffer: outBuf } }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  const pass = commandEncoder.beginComputePass();
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(1);
  pass.end();
  device.queue.submit([commandEncoder.finish()]);

  // read back outBuf
  const readBuf = device.createBuffer({
    size: outBufSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });
  const encoder = device.createCommandEncoder();
  encoder.copyBufferToBuffer(outBuf, 0, readBuf, 0, outBufSize);
  device.queue.submit([encoder.finish()]);

  await readBuf.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuf.getMappedRange();
  const floats = new Float32Array(arrayBuffer.slice(0));
  readBuf.unmap();
  return [...floats];
}

function simpleJSGenerator(prompt: string) {
  // extremely small template-based fallback: tries to be helpful with instructions and summary
  const trimmed = prompt.trim();
  if (!trimmed) return "Hey — tell me what you'd like to do and I can help offline.";
  // very naive heuristics
  if (trimmed.length < 40) {
    return `Quick offline suggestion: ${trimmed}. Try asking me for more details or specify the output format.`;
  }
  if (trimmed.toLowerCase().includes('explain')) {
    return `Offline explanation: ${trimmed}. I can summarise, give examples, or propose steps.`;
  }
  // default echo-ish helpful style
  return `Offline reply: I received your request — "${trimmed}". I can give a short summary or break this into steps.`;
}

export async function generateOfflineReply(prompt: string): Promise<string> {
  try {
    const ctx = await initWebGPU();
    if (ctx) {
      // convert prompt to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(prompt);
      // pad to multiples of 4 to safely view as u32 in shader
      const u32len = Math.ceil(bytes.length / 4) * 4;
      const padded = new Uint8Array(u32len);
      padded.set(bytes);
      const vec = await computeVectorGPU(ctx.device, padded);
      // use the vector to pick a reply slot deterministically
      const s = vec.map((v) => Math.floor(v * 100)).join(',');
      // craft reply using a blend of template and computed fingerprint
      return `Offline (GPU) reply — suggestion fingerprint [${s.slice(0, 40)}...] — ${simpleJSGenerator(prompt)}`;
    }
  } catch (e) {
    console.warn('WebGPU offline fallback failed', e);
  }
  // final fallback: simple JS generator
  return simpleJSGenerator(prompt);
}
