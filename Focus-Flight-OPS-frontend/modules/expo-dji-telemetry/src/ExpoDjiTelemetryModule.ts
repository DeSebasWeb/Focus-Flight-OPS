import { requireNativeModule } from 'expo';

// The native module type includes both functions and EventEmitter methods.
// Using `any` here because the actual native module shape is defined at runtime
// by the Kotlin ExpoDjiTelemetryModule.kt — TypeScript types are enforced
// at the public API layer in index.ts.
export default requireNativeModule<any>('ExpoDjiTelemetry');
