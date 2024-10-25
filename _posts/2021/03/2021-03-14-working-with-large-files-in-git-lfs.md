---
layout: post
title: "Working with Large Files in GIT (LFS)"
date: 2021-03-14 00:00:00 -0600
categories: Post
---

# Working with Large Files in GIT (LFS)

The other day I casually committed a file and when I pused to git I ran into an error letting me know that I was hitting a limit, I exceeded the allowed file size in Git which is 100 MB.

This issue is quite well documented in several places, including this issue in Github: https://github.com/desktop/desktop/issues/4066

Yeah… who commits a file over 100 MB in size in Git.

Guilty as charged… it was a template (potx) that I needed to apply but that had pleeeeeenty of images.

How do I fix this and commit a large file?

#1 First, I need to “uncommit” the file which is easy since I have not pushed it yet (obviously). so a git reset works

#2 Use LFS, Git’s Large File Storage, which is an open source Git extension for versioning large files.

Git Large File Storage (LFS) replaces large files such as audio samples, videos, datasets, and graphics with text pointers inside Git, while storing the file contents on a remote server like GitHub.com or GitHub Enterprise.

It is easy to use, simply install it first. You can download from https://git-lfs.github.com/

Then you need to install in your account by running (this needs to be done only once per account)

```
git lfs install
```

Next up, specify which files you want to track, that is store, in LFS (needs to be done by repo)

```
git lfs track "*.pptx"
```

Repeat for each file type that you intend to store in LFS. This information is stored in a file called .gitattributes.

Finally, commit this file so that anyone that pulls the repo also uses LFS (they need to install it too)

Work normally.

For any files that you committed before LFS, you need to migrate them.

Enjoy!

PS: If you want to learn more, I have an entire course on how to use Git with a GUI

https://app.pluralsight.com/library/courses/using-git-with-gui/table-of-contents





Mar 14, 2021