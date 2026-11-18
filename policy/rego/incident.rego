package incident.authz

# Deny by default — everything is denied unless explicitly allowed
default allow := false

# POLICY-01: Only incident-commander may declare a P0 
allow if { 
    input.method == "POST"
    input.path == ["incidents"]
    input.user.role == "incident-commander"
    input.body.priority == "P0"
} 

# POLICY-02: Any role may declare P1, P2, and P3
allow if { 
    input.method == "POST" 
    input.path == ["incidents"]
    input.body.priority != "P0"
}

# POLICY-03: Only incident-commander may close
allow if { 
    input.method == "PATCH"
    input.path = ["incidents", _, "status"]
    input.user.role == "incident-commander"
    input.body.status == "closed"
}

# POLICY-04: Responders and commanders may move to investigating or resolved
allow if {
    input.method == "PATCH"
    input.path = ["incidents", _, "status"]
    input.user.role in {"incident-commander", "responder"}
    input.body.status in {"investigating", "resolved"}
}

# POLICY-05: Observers have no write access
deny_observer if {
    input.user.role == "observer"
    input.method in {"POST", "PATCH", "PUT", "DELETE"}
}











