"""Test package initialization and basic functionality."""

import pytest
from unittest.mock import patch

from ha_ingestor import __version__


def test_version_attribute():
    """Test that the package has a version attribute."""
    assert hasattr(__import__("ha_ingestor"), "__version__")
    assert ha_ingestor.__version__ == "0.3.0"


def test_version_format():
    """Test that the version follows semantic versioning."""
    version = ha_ingestor.__version__
    assert isinstance(version, str)
    assert len(version.split(".")) == 3
    assert all(part.isdigit() for part in version.split("."))


def test_import_stability():
    """Test that importing the package doesn't cause errors."""
    import ha_ingestor
    assert ha_ingestor is not None


def test_version_consistency():
    """Test that version is consistent across imports."""
    import ha_ingestor as ha1
    import ha_ingestor as ha2
    assert ha1.__version__ == ha2.__version__
    assert ha1.__version__ == "0.3.0"


def test_package_attributes():
    """Test that essential package attributes are present."""
    import ha_ingestor
    assert hasattr(ha_ingestor, "__version__")
    assert hasattr(ha_ingestor, "__name__")
    assert ha_ingestor.__name__ == "ha_ingestor"
