#!/bin/bash

# SafarBot Collaboration API Test Script
# This script provides curl commands to test the collaboration invitation API

echo "🚀 SafarBot Collaboration API Test Script"
echo "=========================================="

# Configuration
BASE_URL="http://localhost:8000"
API_URL="$BASE_URL/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if server is running
print_header "CHECKING SERVER"
if curl -s "$BASE_URL/health" > /dev/null; then
    print_success "Server is running"
else
    print_error "Server is not running. Please start it first:"
    echo "   uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi

# Get user credentials
print_header "AUTHENTICATION"
read -p "Enter your email: " EMAIL
read -s -p "Enter your password: " PASSWORD
echo

# Login and get token
print_info "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    print_error "Login failed!"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

print_success "Login successful! Token: ${TOKEN:0:20}..."

# Get itineraries
print_header "GETTING ITINERARIES"
print_info "Fetching user itineraries..."
ITINERARIES_RESPONSE=$(curl -s -X GET "$API_URL/saved-itinerary/" \
  -H "Authorization: Bearer $TOKEN")

ITINERARY_ID=$(echo $ITINERARIES_RESPONSE | jq -r '.data[0].id // empty')

if [ -z "$ITINERARY_ID" ] || [ "$ITINERARY_ID" = "null" ]; then
    print_error "No itineraries found. Please create an itinerary first."
    echo "Response: $ITINERARIES_RESPONSE"
    exit 1
fi

print_success "Found itinerary: $ITINERARY_ID"

# Get invitation details
print_header "SENDING INVITATION"
read -p "Enter email to invite: " INVITE_EMAIL
read -p "Enter role (viewer/editor/admin) [editor]: " ROLE
ROLE=${ROLE:-editor}
read -p "Enter invitation message (optional): " MESSAGE

# Send invitation
print_info "Sending invitation to: $INVITE_EMAIL"
INVITATION_RESPONSE=$(curl -s -X POST "$API_URL/collaboration/invite" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"itinerary_id\": \"$ITINERARY_ID\",
    \"email\": \"$INVITE_EMAIL\",
    \"role\": \"$ROLE\",
    \"message\": \"$MESSAGE\"
  }")

# Check response
if echo $INVITATION_RESPONSE | jq -e '.success' > /dev/null; then
    print_success "Invitation sent successfully!"
    echo "Response: $INVITATION_RESPONSE"
else
    print_error "Failed to send invitation!"
    echo "Response: $INVITATION_RESPONSE"
fi

# Get invitations
print_header "GETTING INVITATIONS"
print_info "Fetching pending invitations..."
INVITATIONS_RESPONSE=$(curl -s -X GET "$API_URL/collaboration/invitations" \
  -H "Authorization: Bearer $TOKEN")

echo "Invitations Response: $INVITATIONS_RESPONSE"

# Get collaborators
print_header "GETTING COLLABORATORS"
print_info "Fetching collaborators for itinerary: $ITINERARY_ID"
COLLABORATORS_RESPONSE=$(curl -s -X GET "$API_URL/collaboration/collaborators/$ITINERARY_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Collaborators Response: $COLLABORATORS_RESPONSE"

print_header "TEST COMPLETED"
print_success "All tests completed!"

echo -e "\n${YELLOW}Additional curl commands for manual testing:${NC}"
echo
echo "# Send invitation:"
echo "curl -X POST \"$API_URL/collaboration/invite\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer $TOKEN\" \\"
echo "  -d '{\"itinerary_id\":\"$ITINERARY_ID\",\"email\":\"test@example.com\",\"role\":\"editor\",\"message\":\"Test invitation\"}'"
echo
echo "# Get invitations:"
echo "curl -X GET \"$API_URL/collaboration/invitations\" \\"
echo "  -H \"Authorization: Bearer $TOKEN\""
echo
echo "# Get collaborators:"
echo "curl -X GET \"$API_URL/collaboration/collaborators/$ITINERARY_ID\" \\"
echo "  -H \"Authorization: Bearer $TOKEN\""
