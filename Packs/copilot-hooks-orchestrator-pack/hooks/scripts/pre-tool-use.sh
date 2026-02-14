#!/usr/bin/env sh
set -eu

TOOL_NAME="${PACKMAN_TOOL_NAME:-unknown}"
TOOL_ARGS="${PACKMAN_TOOL_ARGS-}"
LC="$(printf '%s %s' "$TOOL_NAME" "$TOOL_ARGS" | tr '[:upper:]' '[:lower:]')"

if printf '%s' "$LC" | grep -Eq '(^|[[:space:]])(rm[[:space:]]+-rf|mkfs|dd[[:space:]]+if=|shutdown|reboot|git[[:space:]]+push|git[[:space:]]+commit|curl[[:space:]]+|wget[[:space:]]+)'; then
	echo "Denied by policy kernel hooks: unsafe tool operation blocked."
	echo "Remediation:"
	echo "- Use non-destructive alternatives (dry-run/list/read)."
	echo "- For commits, set PACKMAN_HOOKS_AUTOCOMMIT=1 explicitly."
	echo "- For network operations, set PACKMAN_HOOKS_NET=1 explicitly."

	case "$LC" in
	*git\ commit* | *git\ push*)
		[ "${PACKMAN_HOOKS_AUTOCOMMIT:-0}" = "1" ] || exit 2
		;;
	*curl* | *wget*)
		[ "${PACKMAN_HOOKS_NET:-0}" = "1" ] || exit 2
		;;
	*)
		exit 2
		;;
	esac
fi

exit 0
