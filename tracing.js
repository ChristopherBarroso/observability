const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor, NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { trace } = require("@opentelemetry/api");


const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

module.exports = (serviceName) => {
    //Jaeger Exporter
    const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

    const exporter = new JaegerExporter({
        endpoint: 'http://localhost:14268/api/traces',
        serviceName: 'todo-service',
    });
    //Create NodeTracerProvider with service name resource attribute
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    //Adds Jaeger Exporter to SimpleSpanProcessor
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    //Register the provider
    provider.register();

    //Register instrumentations
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    //Return the tracer from the provider
    return trace.getTracer(serviceName);
};
