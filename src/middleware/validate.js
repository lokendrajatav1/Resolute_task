export const validate = (schema) => (req, res, next) => {
  const body = schema.body ? schema.body.validate(req.body) : { value: {} };
  const params = schema.params ? schema.params.validate(req.params) : { value: {} };
  const query = schema.query ? schema.query.validate(req.query) : { value: {} };
  const errors = [body.error, params.error, query.error].filter(Boolean);
  if (errors.length) {
    return next(new (class extends Error { constructor(){ super('Validation failed'); this.status=400; this.details=errors.map(e=>e.details);} })());
  }
  req.validated = { body: body.value, params: params.value, query: query.value };
  next();
};
