

export function stripLeadingSlash(path) {
    return path.replace(/^\/+/, '');
}

export function stripTrailingSlash(path) {
    return path.replace(/$\//, '');
}

export function addLeadingSlash(path) {
    return `/${stripLeadingSlash(path)}`;
}

export function addTrailingSlash(path) {
    return `${stripLeadingSlash(path)}/`;
}
