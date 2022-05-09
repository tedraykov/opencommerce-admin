module.exports = {
    branches: ['trunk'],
    repositoryUrl: "git@github.com:tedraykov/opencommerce-admin.git",
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/changelog",
        ["@semantic-release/git", {
            "assets": ["dist/**/*.{js,css}", "docs", "package.json"],
            "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
        }],
        ['@codedependant/semantic-release-docker', {
            dockerTags: ['{{version}}'],
            dockerArgs: {
                API_TOKEN: true,
                VITE_PUBLIC_GRAPHQL_API_URL_HTTP: "https://api.treble.bg/graphql",
                VITE_PUBLIC_GRAPHQL_API_URL_WS: "wss://api.treble.bg/graphql",
                VITE_PUBLIC_FILES_BASE_URL: "https://api.treble.bg",
                VITE_PUBLIC_I18N_BASE_URL: "https://api.treble.bg",
                VITE_PUBLIC_STOREFRONT_HOME_URL: "https://airfit.bg",
                VITE_ROOT_URL: "https://admin.treble.bg",
                VITE_PUBLIC_REST_API_URL: "https://api.treble.bg"
            }
        }]
    ]
}
