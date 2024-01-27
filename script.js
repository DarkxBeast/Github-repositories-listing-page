let currentPage = 1;
let totalPages = 1;
let currentUsername = '';

async function fetchRepositories(page = 1) {

    totalPages = page; // Update the total number of pages for new user

    document.getElementById('profileCard').style.display = 'none';
    document.getElementById('repositories').innerHTML = '';
    document.getElementById('pagination').innerHTML = '';

    const usernameInput = document.getElementById('username');
    const username = usernameInput.value || currentUsername;
    const perPage = document.getElementById('perPage').value;
    const profileUrl = `https://api.github.com/users/${username}`;
    const reposUrl = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;

    if (!username) {
        alert('Please enter a username.');
        return;
    }

    currentUsername = username;
    usernameInput.value = '';
    usernameInput.blur();

    document.getElementById('welcome-text').style.display = 'none';

    showSpinner();

    try {
        // Fetch profile only for the first page
        if (page === 1) {
            const profileResponse = await fetch(profileUrl);
            const profileData = await profileResponse.json();

            if (profileResponse.status === 404) {
                hideSpinner();
                alert('User not found. Please try again.');
                return;
            }

            displayProfile(profileData);
            document.getElementById('profileCard').style.display = 'inline-block';
        } else {
            document.getElementById('profileCard').style.display = 'none';
        }

        const reposResponse = await fetch(reposUrl);
        const reposData = await reposResponse.json();

        hideSpinner();

        const linkHeader = reposResponse.headers.get('Link');
        if (linkHeader) {
            const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
            if (match) {
                totalPages = parseInt(match[1], 10);
            }
        }

        displayRepositories(reposData);
        displayPagination();
    } catch (error) {
        hideSpinner();
        console.log(error);
        alert('Error fetching data. Please try again.');
    }
}
3333 
''
function showSpinner() {
    document.getElementById('spinner').style.display = 'block';
}

function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

function displayProfile(profile) {
    const profileCard = document.getElementById('profileCard');
    profileCard.querySelector('.card-title').textContent = profile.name;
    profileCard.querySelector('.card-text').textContent = profile.bio;
    profileCard.querySelector('.card-img').src = profile.avatar_url;
}

function displayRepositories(repositories) {
    const repositoriesContainer = document.getElementById('repositories');
    repositoriesContainer.innerHTML = ''; // Clear previous results

    if (repositories.length === 0) {
        repositoriesContainer.innerHTML = '<p>No repositories found for the specified user.</p>';
        return;
    }

    repositories.forEach(repo => {
        const repoTemplate = document.getElementById('repo-template');
        const repoElement = repoTemplate.content.cloneNode(true);

        repoElement.querySelector('.card-title').textContent = repo.name;
        repoElement.querySelector('.card-header .card-text').textContent = `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`;
        repoElement.querySelector('.card-body .card-text').textContent = repo.description || 'No description available.';
        repoElement.querySelector('.card-body p strong').textContent = `Language: ${repo.language || 'Not specified'}`;
        repoElement.querySelector('.btn').href = repo.html_url;

        repositoriesContainer.appendChild(repoElement);
    });

}

function displayPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    // Create the previous page button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'page-button';
    prevButton.disabled = currentPage === 1; // Disable the button if we're on the first page
    prevButton.addEventListener('click', () => {
        currentPage--;
        fetchRepositories(currentPage); // Fetch repositories for the previous page
        window.scrollTo(0, 0); // Scroll to the top of the page
    });
    paginationContainer.appendChild(prevButton);

    // Create the page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = 'page-button';
        pageButton.disabled = i === currentPage; // Disable the button for the current page
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchRepositories(currentPage); // Fetch repositories for the clicked page
            window.scrollTo(0, 0); // Scroll to the top of the page
        });
        paginationContainer.appendChild(pageButton);
    }

    // Create the next page button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'page-button';
    nextButton.disabled = currentPage === totalPages; // Disable the button if we're on the last page
    nextButton.addEventListener('click', () => {
        currentPage++;
        fetchRepositories(currentPage); // Fetch repositories for the next page
        window.scrollTo(0, 0); // Scroll to the top of the page
    });
    paginationContainer.appendChild(nextButton);

}

