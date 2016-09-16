
-- verify the request has a valid token associated with it
function verifyRequestToken(response, request)
  if request.headers["authorization"] ~= nil then
    local resp = User.getCurrentUser({token=request.headers.authorization})
    if resp.error == nil then
      return true
    end
  end
  response.code = 401
  response.message = {status="error", message="invalid auth"}
  return false
end
