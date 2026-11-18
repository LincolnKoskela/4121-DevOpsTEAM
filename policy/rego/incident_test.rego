package incident.authz

import rego.v1

test_commander_can_create_p0 if {
    allow with input as {
        "method": "POST",
        "path": ["incidents"],
        "user": {"role": "incident-commander"},
        "body": {"priority": "P0"}
    }
}

test_responder_cannot_create_p0 if {
    not allow with input as {
        "method": "POST",
        "path": ["incidents"],
        "user": {"role": "responder"},
        "body": {"priority": "P0"}
    }
}

test_observer_cannot_close_incident if {
    not allow with input as {
        "method": "PATCH",
        "path": ["incidents", "123", "status"],
        "user": {"role": "observer"},
        "body": {"status": "closed"}
    }
}
